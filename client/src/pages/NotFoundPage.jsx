import { Link } from "react-router-dom";

const NotFoundPage = () => {
  return (
    <div className="py-20 text-center">
      <h1 className="text-6xl font-bold text-primary-500">404</h1>
      <p className="mt-4 text-xl text-text">Sayfa bulunamadı</p>
      <p className="mt-2 text-muted-foreground">
        Aradığınız sayfa mevcut değil veya taşınmış olabilir.
      </p>
      <Link
        to="/"
        className="inline-block mt-6 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors"
      >
        Ana Sayfaya Dön
      </Link>
    </div>
  );
};

export default NotFoundPage;
