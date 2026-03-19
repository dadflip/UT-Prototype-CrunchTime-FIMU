import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'Fichier requis' },
        { status: 400 }
      );
    }

    const text = await file.text();
    const lines = text.split('\n');

    if (lines.length < 2) {
      return NextResponse.json(
        { error: 'Fichier vide ou invalide' },
        { status: 400 }
      );
    }

    const header = lines[0].split(',').map((h) => h.trim());
    const records: any[] = [];

    // Parse CSV
    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue;

      const values = lines[i].split(',').map((v) => v.replace(/"/g, '').trim());
      const record: any = {};

      header.forEach((h, idx) => {
        record[h.toLowerCase()] = values[idx];
      });

      records.push(record);
    }

    // Detect what we're importing
    const importType = detectImportType(header);
    let importResult = { success: false, message: '', records_imported: 0 };

    if (importType === 'artists') {
      importResult = await importArtists(records);
    } else if (importType === 'categories') {
      importResult = await importCategories(records);
    } else if (importType === 'jury') {
      importResult = await importJuryMembers(records);
    }

    // Log sync
    await supabase.from('excel_sync_logs').insert({
      operation_type: 'import',
      source_file: file.name,
      status: importResult.success ? 'success' : 'failed',
      records_affected: importResult.records_imported,
    });

    return NextResponse.json(importResult);
  } catch (error) {
    console.error('[v0] Excel import error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'import' },
      { status: 500 }
    );
  }
}

function detectImportType(header: string[]): 'artists' | 'categories' | 'jury' | 'unknown' {
  const lowerHeader = header.map((h) => h.toLowerCase());

  if (lowerHeader.includes('categorie') && lowerHeader.includes('artiste')) {
    return 'artists';
  }
  if (lowerHeader.includes('category') && lowerHeader.includes('name')) {
    return 'categories';
  }
  if (lowerHeader.includes('jury') || lowerHeader.includes('member_name')) {
    return 'jury';
  }

  return 'unknown';
}

async function importArtists(records: any[]) {
  try {
    const insertRecords: any[] = [];

    for (const record of records) {
      const categoryName = record.categorie || record.category;
      const artistName = record.artiste || record.artist || record.name;

      if (!categoryName || !artistName) continue;

      // Find category
      const { data: category } = await supabase
        .from('categories')
        .select('id')
        .eq('name', categoryName)
        .single();

      if (!category) continue;

      insertRecords.push({
        id: uuidv4(),
        name: artistName,
        category_id: category.id,
        artist_number: record.number || insertRecords.length + 1,
        description: record.description || null,
        is_active: true,
      });
    }

    if (insertRecords.length === 0) {
      return { success: false, message: 'Aucun artiste à importer', records_imported: 0 };
    }

    const { error } = await supabase.from('artists').insert(insertRecords);

    if (error) throw error;

    return {
      success: true,
      message: `${insertRecords.length} artiste(s) importé(s)`,
      records_imported: insertRecords.length,
    };
  } catch (error) {
    console.error('[v0] Artist import error:', error);
    return { success: false, message: 'Erreur lors de l\'import des artistes', records_imported: 0 };
  }
}

async function importCategories(records: any[]) {
  try {
    const insertRecords: any[] = [];

    for (let i = 0; i < records.length; i++) {
      const record = records[i];
      const name = record.name || record.categorie || record.category;

      if (!name) continue;

      insertRecords.push({
        id: uuidv4(),
        name,
        description: record.description || null,
        order_index: i + 1,
        is_active: true,
      });
    }

    if (insertRecords.length === 0) {
      return { success: false, message: 'Aucune catégorie à importer', records_imported: 0 };
    }

    const { error } = await supabase.from('categories').insert(insertRecords);

    if (error) throw error;

    return {
      success: true,
      message: `${insertRecords.length} catégorie(s) importée(s)`,
      records_imported: insertRecords.length,
    };
  } catch (error) {
    console.error('[v0] Category import error:', error);
    return { success: false, message: 'Erreur lors de l\'import des catégories', records_imported: 0 };
  }
}

async function importJuryMembers(records: any[]) {
  try {
    const insertRecords: any[] = [];

    for (const record of records) {
      const name = record.name || record.member_name;
      const pin = record.pin || record.code;

      if (!name || !pin) continue;

      // Hash PIN (simple SHA256)
      const pinHash = require('crypto')
        .createHash('sha256')
        .update(pin)
        .digest('hex');

      insertRecords.push({
        id: uuidv4(),
        member_name: name,
        pin_hash: pinHash,
        email: record.email || null,
        is_active: true,
      });
    }

    if (insertRecords.length === 0) {
      return { success: false, message: 'Aucun jury à importer', records_imported: 0 };
    }

    const { error } = await supabase.from('jury_members').insert(insertRecords);

    if (error) throw error;

    return {
      success: true,
      message: `${insertRecords.length} juré(s) importé(s)`,
      records_imported: insertRecords.length,
    };
  } catch (error) {
    console.error('[v0] Jury import error:', error);
    return { success: false, message: 'Erreur lors de l\'import des jurés', records_imported: 0 };
  }
}
