const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-card/50 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 py-6 flex flex-col items-center gap-2 text-sm text-muted-foreground">
        <p>&copy; {currentYear} BlogMERN. All rights reserved.</p>
        <p>
          Created by{" "}
          <a
            href="https://serkanbayraktar.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary-500 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
          >
            Serkanby
          </a>
          {" | "}
          <a
            href="https://github.com/Serkanbyx"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary-500 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
          >
            Github
          </a>
        </p>
      </div>
    </footer>
  );
};

export default Footer;
