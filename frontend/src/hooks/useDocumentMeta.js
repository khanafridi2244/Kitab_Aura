import { useEffect } from "react";

// Sets the browser tab title and the meta description while a page is open
export function useDocumentMeta(title, description) {
  useEffect(() => {
    const meta = document.querySelector('meta[name="description"]');
    const previousTitle = document.title;
    const previousDescription = meta?.getAttribute("content");

    if (title) document.title = title;
    if (description && meta) meta.setAttribute("content", description);

    return () => {
      document.title = previousTitle;
      if (meta && previousDescription != null) meta.setAttribute("content", previousDescription);
    };
  }, [title, description]);
}