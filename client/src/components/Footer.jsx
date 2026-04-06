const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-card/50 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
        &copy; {currentYear} BlogMERN. Tüm hakları saklıdır.
      </div>
    </footer>
  );
};

export default Footer;
