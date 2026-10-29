import { notFound } from "next/navigation";
import { getLegalDocumentBySlug, getLegalDocuments } from "@/data/legalDocuments";
import { LegalDocumentViewer } from "@/components/legal/LegalDocumentViewer";

export function generateStaticParams() {
  const docs = getLegalDocuments();
  return docs.map((doc) => ({
    slug: doc.slug,
  }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const doc = getLegalDocumentBySlug(slug);

  if (!doc) {
    return {
      title: "Dokumen Legalitas Tidak Ditemukan",
    };
  }

  return {
    title: `${doc.shortTitle} - Yayasan Payung Berkah`,
    description: `Salinan resmi ${doc.title} (${doc.number}) Yayasan Payung Berkah. Diterbitkan oleh ${doc.issuer}.`,
    openGraph: {
      title: `${doc.title} - Legalitas Resmi Yayasan Payung Berkah`,
      description: doc.description,
      type: "article",
      images: [
        {
          url: doc.image,
          width: 1147,
          height: 1600,
          alt: doc.title,
        },
      ],
    },
  };
}

export default async function LegalDetailPage({ params }) {
  const { slug } = await params;
  const doc = getLegalDocumentBySlug(slug);

  if (!doc) {
    notFound();
  }

  const allDocs = getLegalDocuments();

  return <LegalDocumentViewer currentDoc={doc} allDocs={allDocs} />;
}
