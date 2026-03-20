'use client';

export function Footer() {
  return (
    <footer className="border-t border-border bg-card/50 mt-auto">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-sm text-muted-foreground">
            <p className="font-medium">FIMU Voting System</p>
            <p>Festival International de Musique Universitaire</p>
          </div>
          
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#A21825]" />
              <span>Vote</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#FEEB85]" />
              <span>Classement</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#A21825]" />
              <span>Résultats</span>
            </div>
          </div>
          
          <div className="text-xs text-muted-foreground">
            © 2026 FIMU - Tous droits réservés
          </div>
        </div>
      </div>
    </footer>
  );
}
