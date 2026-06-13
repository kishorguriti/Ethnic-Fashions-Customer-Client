import { useEffect, useState } from "react";
import { Spin } from "antd";
import { getStaticPageBySlug, type StaticPageData } from "../../services/staticPageApi";

interface StaticPageProps {
  slug: string;
}

export default function StaticPage({ slug }: StaticPageProps) {
  const [page, setPage] = useState<StaticPageData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getStaticPageBySlug(slug).then((data) => {
      setPage(data);
      setLoading(false);
      document.title = data?.metaTitle || data?.title || "Page Not Available";
    });
  }, [slug]);

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <Spin size="large" />
      </div>
    );
  }

  if (!page) {
    return (
      <div className="container static-page py-5">
        <h2>Page Not Available</h2>
        <p className="text-muted">This page is currently unavailable. Please check back later.</p>
      </div>
    );
  }

  return (
    <div className="container static-page py-5">
      <h1 className="static-page-title mb-4">{page.title}</h1>
      <div className="static-page-content" dangerouslySetInnerHTML={{ __html: page.content }} />
    </div>
  );
}
