const Footer = () => {
  return (
    <footer className="bg-card border-t border-border mt-auto">
      <div className="container mx-auto px-4 py-6 text-center text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} ChennaiArtisanConnect. All rights reserved.</p>
        <p className="text-sm mt-1">Empowering Local Artisans with Blockchain Technology.</p>
      </div>
    </footer>
  );
};

export default Footer;
