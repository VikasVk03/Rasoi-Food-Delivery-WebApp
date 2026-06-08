import React from "react";

const SiteFooter = () => {
  return (
    <footer className="bg-white border-t border-gray-100 mt-10">
      <div className="max-w-6xl mx-auto px-4 py-5 text-sm text-gray-500 flex items-center justify-between gap-3">
        <p>© {new Date().getFullYear()} Rasoi. All rights reserved.</p>
        <p>Fresh food, fast delivery.</p>
      </div>
    </footer>
  );
};

export default SiteFooter;
