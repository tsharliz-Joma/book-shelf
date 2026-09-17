import React, {useState, useEffect, useCallback} from "react";
import {
  Plus,
  X,
  BookOpen,
  Search,
  Loader2,
  Trash2,
  Check,
  RotateCcw,
  Menu,
} from "lucide-react";

const COLORS = {
  bg: "#1B1E27",
  panel: "#252938",
  panelAlt: "#1F2330",
  text: "#F3EFE6",
  textMuted: "#9AA0AE",
  textFaint: "#5A6070",
  accent: "#C99A3D",
  accentText: "#241D0F",
  wood: "#7A4B32",
  danger: "#C97B5F",
  dangerBg: "#3A2A28",
};

const SPINES = [
  {bg: "#2F6B5E", text: "#F3EFE6"},
  {bg: "#C99A3D", text: "#241D0F"},
  {bg: "#9C4B3F", text: "#F3EFE6"},
  {bg: "#6B8F71", text: "#241D0F"},
  {bg: "#7A5C7E", text: "#F3EFE6"},
  {bg: "#4C6B8A", text: "#F3EFE6"},
  {bg: "#385C59", text: "#F3EFE6"},
  {bg: "#A85D3F", text: "#F3EFE6"},
  {bg: "#8A7A45", text: "#241D0F"},
  {bg: "#596B78", text: "#F3EFE6"},
];

const STORAGE_KEY = "books";

function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function secureImg(url) {
  if (!url) return null;
  return url.replace("http://", "https://");
}

function searchQuery(value) {
  const compact = value.replace(/[-\s]/g, "");
  return /^(?:\d{10}|\d{13})$/.test(compact) ? `isbn:${compact}` : value;
}

function getUrlIsbn() {
  const params = new URLSearchParams(window.location.search);
  const candidates = [
    params.get("isbn"),
    params.get("isbn10"),
    params.get("isbn13"),
    params.get("isbn_10"),
    params.get("isbn_13"),
  ];
  const pathAndQuery = `${window.location.pathname} ${window.location.search}`;
  candidates.push(pathAndQuery);
  return (
    candidates
      .map((value) => value || "")
      .map((value) => value.replace(/[-\s]/g, ""))
      .find((value) => /(?:^|\D)(?:\d{10}|\d{13})(?:$|\D)/.test(value))
      ?.match(/(?:\d{10}|\d{13})/)?.[0] || null
  );
}

function toBookResult(doc) {
  return {
    id:
      doc.key ||
      doc.cover_edition_key ||
      `${doc.title}-${doc.first_publish_year || ""}`,
    volumeInfo: {
      title: doc.title || "Untitled",
      authors: doc.author_name || [],
      imageLinks: doc.cover_i
        ? {
            thumbnail: `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg`,
          }
        : undefined,
      publishedDate: doc.first_publish_year
        ? String(doc.first_publish_year)
        : "",
      industryIdentifiers: doc.isbn?.[0]
        ? [{type: "ISBN", identifier: doc.isbn[0]}]
        : [],
    },
  };
}

function bookFromResult(item) {
  const info = item.volumeInfo || {};
  const isbnObj =
    (info.industryIdentifiers || []).find((id) => id.type === "ISBN_13") ||
    (info.industryIdentifiers || [])[0];
  return {
    id: item.id,
    title: info.title || "Untitled",
    authors: info.authors || [],
    thumbnail: secureImg(info.imageLinks?.thumbnail),
    publishedDate: info.publishedDate || "",
    isbn: isbnObj?.identifier || "",
    status: "to-read",
  };
}

export default function BookShelfLibrary() {
  const [view, setView] = useState("shelf");
  const [books, setBooks] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [selected, setSelected] = useState(null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [saveError, setSaveError] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      const parsed = stored ? JSON.parse(stored) : [];
      setBooks(
        Array.isArray(parsed)
          ? parsed.map((book) => ({...book, status: book.status || "to-read"}))
          : [],
      );
    } catch (e) {
      setBooks([]);
    } finally {
      setLoaded(true);
    }
  }, []);

  const persist = useCallback((nextBooks) => {
    setBooks(nextBooks);
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextBooks));
      setSaveError("");
    } catch (e) {
      setSaveError("Could not save that. Try again.");
    }
  }, []);

  const searchBooks = async (value) => {
    const r = await fetch(
      `https://openlibrary.org/search.json?q=${encodeURIComponent(searchQuery(value))}&limit=12&fields=key,title,author_name,cover_i,first_publish_year,isbn`,
    );
    if (!r.ok) throw new Error(`Search failed with status ${r.status}`);
    const data = await r.json();
    return (data.docs || []).map(toBookResult);
  };

  const search = async () => {
    if (!query.trim()) return;
    setSearching(true);
    setSearchError("");
    setResults([]);
    try {
      const items = await searchBooks(query.trim());
      setResults(items);
      if (items.length === 0) {
        setSearchError("No books found. Try a different search.");
      }
    } catch (e) {
      setSearchError("Search failed. Check your connection and try again.");
    } finally {
      setSearching(false);
    }
  };

  const addBook = (item) => {
    const book = bookFromResult(item);
    if (books.some((b) => b.id === book.id)) return;
    persist([...books, book]);
    setView("shelf");
    setQuery("");
    setResults([]);
  };

  const updateStatus = (id, status) => {
    persist(books.map((book) => (book.id === id ? {...book, status} : book)));
    setSelected((book) => (book ? {...book, status} : book));
  };

  const removeBook = (id) => {
    persist(books.filter((b) => b.id !== id));
    setSelected(null);
  };

  useEffect(() => {
    if (!loaded) return;
    const isbn = getUrlIsbn();
    if (
      !isbn ||
      books.some((book) => book.isbn?.replace(/[-\s]/g, "") === isbn)
    ) {
      return;
    }
    searchBooks(isbn)
      .then((items) => {
        if (items[0] && !books.some((book) => book.id === items[0].id)) {
          persist([...books, bookFromResult(items[0])]);
        }
      })
      .catch(() => setSearchError("Could not add the book from this ISBN."));
  }, [loaded]);

  const visibleBooks =
    view === "to-read"
      ? books.filter((book) => book.status !== "read")
      : view === "read"
        ? books.filter((book) => book.status === "read")
        : books;
  const viewLabel =
    view === "to-read" ? "To read" : view === "read" ? "Read" : "Your shelf";

  return (
    <div className="min-h-screen w-full" style={{background: COLORS.bg}}>
      <style>{`
        .font-spine { font-family: 'Roboto', sans-serif; }
        .font-ui { font-family: 'Roboto', sans-serif; }
      `}</style>

      <div className="max-w-2xl mx-auto px-5 py-8 font-ui">
        <div className="flex items-center justify-between mb-8">
          <h1
            className="font-spine text-2xl tracking-tight"
            style={{color: COLORS.text}}>
            {viewLabel}
          </h1>
          <div
            className="hidden md:flex rounded-full p-1"
            style={{background: COLORS.panel}}>
            <button
              onClick={() => setView("shelf")}
              className="px-4 py-1.5 rounded-full text-sm transition"
              style={{
                background: view === "shelf" ? COLORS.accent : "transparent",
                color: view === "shelf" ? COLORS.accentText : COLORS.textMuted,
              }}>
              Shelf
            </button>
            <button
              onClick={() => setView("add")}
              className="px-4 py-1.5 rounded-full text-sm transition"
              style={{
                background: view === "add" ? COLORS.accent : "transparent",
                color: view === "add" ? COLORS.accentText : COLORS.textMuted,
              }}>
              Add
            </button>
            <button
              onClick={() => setView("to-read")}
              className="px-4 py-1.5 rounded-full text-sm transition"
              style={{
                background: view === "to-read" ? COLORS.accent : "transparent",
                color:
                  view === "to-read" ? COLORS.accentText : COLORS.textMuted,
              }}>
              To read
            </button>
            <button
              onClick={() => setView("read")}
              className="px-4 py-1.5 rounded-full text-sm transition"
              style={{
                background: view === "read" ? COLORS.accent : "transparent",
                color: view === "read" ? COLORS.accentText : COLORS.textMuted,
              }}>
              Read
            </button>
          </div>
          <div className="relative md:hidden">
            <button
              onClick={() => setMenuOpen((open) => !open)}
              aria-label="Open navigation menu"
              aria-expanded={menuOpen}
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{background: COLORS.panel, color: COLORS.text}}>
              <Menu size={20} />
            </button>
            {menuOpen && (
              <div
                className="absolute right-0 top-12 z-40 rounded-xl p-1 w-36 shadow-lg"
                style={{background: COLORS.panel}}>
                {[
                  ["shelf", "Shelf"],
                  ["add", "Add"],
                  ["to-read", "To read"],
                  ["read", "Read"],
                ].map(([nextView, label]) => (
                  <button
                    key={nextView}
                    onClick={() => {
                      setView(nextView);
                      setMenuOpen(false);
                    }}
                    className="block w-full text-left px-3 py-2 rounded-lg text-sm"
                    style={{
                      background:
                        view === nextView ? COLORS.accent : "transparent",
                      color:
                        view === nextView
                          ? COLORS.accentText
                          : COLORS.textMuted,
                    }}>
                    {label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {view !== "add" && (
          <>
            {!loaded ? (
              <div
                className="flex items-center justify-center py-24"
                style={{color: COLORS.textMuted}}>
                <Loader2 className="animate-spin" size={20} />
              </div>
            ) : visibleBooks.length === 0 ? (
              <div className="flex flex-col items-center text-center py-20">
                <BookOpen className="mb-4" size={32} color={COLORS.wood} />
                <p className="mb-5" style={{color: COLORS.textMuted}}>
                  {view === "read"
                    ? "You have not marked any books as read yet."
                    : view === "to-read"
                      ? "Your to-read list is empty."
                      : "Your shelf is empty. Add your first book to get started."}
                </p>
                <button
                  onClick={() => setView("add")}
                  className="px-5 py-2.5 rounded-full text-sm font-medium flex items-center gap-2"
                  style={{background: COLORS.accent, color: COLORS.accentText}}>
                  <Plus size={16} /> Add a book
                </button>
              </div>
            ) : (
              <div>
                <div
                  className="flex flex-wrap items-end gap-1.5 pb-3 px-2"
                  style={{
                    borderBottom: `10px solid ${COLORS.wood}`,
                    borderRadius: "2px",
                  }}>
                  {visibleBooks.map((book) => {
                    const h = hashString(book.id || book.title);
                    const color = SPINES[h % SPINES.length];
                    const height = 130 + (h % 5) * 12;
                    return (
                      <button
                        key={book.id}
                        onClick={() => setSelected(book)}
                        className="relative rounded-t-md shadow-md flex items-end justify-center overflow-hidden shrink-0 transition-transform hover:-translate-y-1"
                        style={{background: color.bg, width: 34, height}}
                        title={book.title}>
                        <span
                          className="font-spine text-xs font-bold leading-tight px-2 pt-3 whitespace-nowrap"
                          style={{
                            color: color.text,
                            writingMode: "vertical-rl",
                            transform: "rotate(180deg)",
                            maxHeight: height - 16,
                            overflow: "hidden",
                          }}>
                          {book.title}
                        </span>
                      </button>
                    );
                  })}
                </div>
                <p
                  className="text-xs mt-3 px-2"
                  style={{color: COLORS.textFaint}}>
                  {visibleBooks.length} book
                  {visibleBooks.length === 1 ? "" : "s"}
                  {view === "shelf" ? " on the shelf" : ""}
                </p>
              </div>
            )}
          </>
        )}

        {view === "add" && (
          <div>
            <div className="flex gap-2 mb-5">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && search()}
                placeholder="Title, author, or ISBN"
                className="flex-1 px-4 py-2.5 rounded-full text-sm outline-none"
                style={{background: COLORS.panel, color: COLORS.text}}
              />
              <button
                onClick={search}
                className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                style={{background: COLORS.accent, color: COLORS.accentText}}>
                {searching ? (
                  <Loader2 className="animate-spin" size={16} />
                ) : (
                  <Search size={16} />
                )}
              </button>
            </div>

            {searchError && (
              <p className="text-sm mb-4" style={{color: COLORS.danger}}>
                {searchError}
              </p>
            )}

            <div className="space-y-2">
              {results.map((item) => {
                const info = item.volumeInfo || {};
                const already = books.some((b) => b.id === item.id);
                return (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 p-2.5 rounded-xl"
                    style={{background: COLORS.panel}}>
                    {info.imageLinks?.thumbnail ? (
                      <img
                        src={secureImg(info.imageLinks.thumbnail)}
                        alt=""
                        className="w-10 h-14 object-cover rounded shrink-0"
                      />
                    ) : (
                      <div
                        className="w-10 h-14 rounded shrink-0 flex items-center justify-center"
                        style={{background: COLORS.panelAlt}}>
                        <BookOpen size={16} color={COLORS.textFaint} />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p
                        className="text-sm truncate"
                        style={{color: COLORS.text}}>
                        {info.title || "Untitled"}
                      </p>
                      <p
                        className="text-xs truncate"
                        style={{color: COLORS.textMuted}}>
                        {(info.authors || []).join(", ") || "Unknown author"}
                      </p>
                    </div>
                    <button
                      onClick={() => addBook(item)}
                      disabled={already}
                      className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                      style={{
                        background: already ? COLORS.panelAlt : COLORS.accent,
                        color: already ? COLORS.textFaint : COLORS.accentText,
                      }}>
                      <Plus size={14} />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {saveError && (
          <p className="text-xs mt-4" style={{color: COLORS.danger}}>
            {saveError}
          </p>
        )}
      </div>

      {selected && (
        <div
          className="fixed inset-0 flex items-center justify-center p-6 z-50"
          style={{background: "rgba(0,0,0,0.5)"}}
          onClick={() => setSelected(null)}>
          <div
            className="rounded-2xl p-6 max-w-xs w-full font-ui"
            style={{background: COLORS.panel}}
            onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-end mb-2">
              <button
                onClick={() => setSelected(null)}
                style={{color: COLORS.textMuted}}>
                <X size={18} />
              </button>
            </div>
            <div className="flex gap-4">
              {selected.thumbnail ? (
                <img
                  src={selected.thumbnail}
                  alt=""
                  className="w-20 h-28 object-cover rounded shrink-0"
                />
              ) : (
                <div
                  className="w-20 h-28 rounded shrink-0 flex items-center justify-center"
                  style={{background: COLORS.panelAlt}}>
                  <BookOpen size={20} color={COLORS.textFaint} />
                </div>
              )}
              <div className="min-w-0">
                <p
                  className="font-spine text-base leading-snug"
                  style={{color: COLORS.text}}>
                  {selected.title}
                </p>
                <p className="text-sm mt-1" style={{color: COLORS.textMuted}}>
                  {(selected.authors || []).join(", ") || "Unknown author"}
                </p>
                {selected.publishedDate && (
                  <p className="text-xs mt-1" style={{color: COLORS.textFaint}}>
                    {selected.publishedDate}
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={() =>
                updateStatus(
                  selected.id,
                  selected.status === "read" ? "to-read" : "read",
                )
              }
              className="mt-5 w-full py-2 rounded-full text-sm flex items-center justify-center gap-2"
              style={{background: COLORS.accent, color: COLORS.accentText}}>
              {selected.status === "read" ? (
                <>
                  <RotateCcw size={14} /> Move to to-read
                </>
              ) : (
                <>
                  <Check size={14} /> Mark as read
                </>
              )}
            </button>
            <button
              onClick={() => removeBook(selected.id)}
              className="mt-2 w-full py-2 rounded-full text-sm flex items-center justify-center gap-2"
              style={{background: COLORS.dangerBg, color: COLORS.danger}}>
              <Trash2 size={14} /> Remove from shelf
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
