
"use client";

import Link from "next/link";
import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { addToCart } from "@/lib/cart";
import { products, type Product } from "@/constant/ProductPageData";
import {
  Heart,
  ShoppingCart,
  ZoomIn,
  ZoomOut,
  X,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  FileText,
  Truck,
} from "lucide-react";

function ProductDetailsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const productId = Number(searchParams.get("id"));

  const product: Product | undefined = products.find(
    (item) => item.id === productId,
  );

  const [activeImage, setActiveImage] = useState(0);
  const [color, setColor] = useState("Black");
  const [quantity, setQuantity] = useState(1);
  const [liked, setLiked] = useState(false);

  const [isPageScrolled, setIsPageScrolled] = useState(false);
  const [isZoomOpen, setIsZoomOpen] = useState(false);
  const [zoom, setZoom] = useState(1);

  const [loadedProductId, setLoadedProductId] = useState<number | null>(
    null,
  );

  const thumbnailRef = useRef<HTMLDivElement>(null);

  const gallery = product?.details.gallery ?? [];
  const currentImage = gallery[activeImage] || product?.image || "";

  // Calculate total price.
  const totalPrice = product ? product.price * quantity : 0;

  // Load saved quantity, color and wishlist.
  useEffect(() => {
    if (!product) return;

    setLoadedProductId(null);

    setQuantity(1);
    setColor("Black");
    setLiked(false);

    try {
      const savedQuantity = localStorage.getItem(
        `fms-product-quantity-${product.id}`,
      );

      const savedColor = localStorage.getItem(
        `fms-product-color-${product.id}`,
      );

      const savedWishlist = JSON.parse(
        localStorage.getItem("fms-wishlist") || "[]",
      );

      if (savedQuantity) {
        const parsedQuantity = Number(savedQuantity);

        if (Number.isInteger(parsedQuantity) && parsedQuantity >= 1) {
          setQuantity(parsedQuantity);
        }
      }

      if (savedColor) {
        setColor(savedColor);
      }

      setLiked(
        Array.isArray(savedWishlist) &&
          savedWishlist.includes(product.id),
      );
    } catch (error) {
      console.error("Could not load saved product data:", error);
    }

    setLoadedProductId(product.id);
  }, [product?.id]);

  // Save quantity and total price together.
  useEffect(() => {
    if (!product || loadedProductId !== product.id) return;

    try {
      const calculatedTotal = product.price * quantity;

      localStorage.setItem(
        `fms-product-quantity-${product.id}`,
        String(quantity),
      );

      localStorage.setItem(
        `fms-product-total-price-${product.id}`,
        String(calculatedTotal),
      );
    } catch (error) {
      console.error("Could not save quantity and total price:", error);
    }
  }, [quantity, product?.id, product?.price, loadedProductId]);

  // Save color.
  useEffect(() => {
    if (!product || loadedProductId !== product.id) return;

    try {
      localStorage.setItem(
        `fms-product-color-${product.id}`,
        color,
      );
    } catch (error) {
      console.error("Could not save color:", error);
    }
  }, [color, product?.id, loadedProductId]);

  // Save wishlist.
  useEffect(() => {
    if (!product || loadedProductId !== product.id) return;

    try {
      const savedWishlist = JSON.parse(
        localStorage.getItem("fms-wishlist") || "[]",
      );

      const safeWishlist = Array.isArray(savedWishlist)
        ? savedWishlist
        : [];

      const updatedWishlist = liked
        ? [...new Set([...safeWishlist, product.id])]
        : safeWishlist.filter((id: number) => id !== product.id);

      localStorage.setItem(
        "fms-wishlist",
        JSON.stringify(updatedWishlist),
      );
    } catch (error) {
      console.error("Could not save wishlist:", error);
    }
  }, [liked, product?.id, loadedProductId]);

  // Reset gallery when another product is opened.
  useEffect(() => {
    setActiveImage(0);
    setZoom(1);
    setIsZoomOpen(false);
  }, [product?.id]);

  // Page scroll state.
  useEffect(() => {
    const handleScroll = () => {
      setIsPageScrolled(window.scrollY > 0);
    };

    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Keyboard controls for image zoom.
  useEffect(() => {
    if (!isZoomOpen || gallery.length === 0) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsZoomOpen(false);
        setZoom(1);
      }

      if (event.key === "ArrowRight") {
        setActiveImage((prev) => (prev + 1) % gallery.length);
        setZoom(1);
      }

      if (event.key === "ArrowLeft") {
        setActiveImage(
          (prev) => (prev - 1 + gallery.length) % gallery.length,
        );
        setZoom(1);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isZoomOpen, gallery.length]);

  if (!product) {
    return (
      <main className="min-h-screen bg-[#f7f7f8] flex flex-col items-center justify-center px-4 text-center">
        <h1 className="text-2xl font-bold">Product Not Found</h1>

        <p className="mt-3 text-gray-500">
          The product you are looking for does not exist.
        </p>

        <Link
          href="/productpage"
          className="mt-5 rounded-full bg-[#ff9900] px-6 py-3 font-semibold"
        >
          Back to Products
        </Link>
      </main>
    );
  }

  const money = (price: number) => `£${price.toFixed(2)} GBP`;

  const openZoom = () => {
    if (!currentImage) return;

    setZoom(1);
    setIsZoomOpen(true);
  };

  const closeZoom = () => {
    setIsZoomOpen(false);
    setZoom(1);
  };

  const scrollThumbnails = (direction: "up" | "down") => {
    thumbnailRef.current?.scrollBy({
      top: direction === "up" ? -180 : 180,
      behavior: "smooth",
    });
  };

  const previousImage = () => {
    if (gallery.length === 0) return;

    setActiveImage(
      (prev) => (prev - 1 + gallery.length) % gallery.length,
    );

    setZoom(1);
  };

  const nextImage = () => {
    if (gallery.length === 0) return;

    setActiveImage((prev) => (prev + 1) % gallery.length);

    setZoom(1);
  };

  // Add selected product and quantity to cart.
  const handleAddToCart = () => {
    addToCart({
      id: String(product.id),
      title: product.name,
      price: product.price,
      image: product.image,
      color,
      quantity,
    });

    router.push("/cart");
  };

  const handleBuyNow = () => {
    addToCart({
      id: String(product.id),
      title: product.name,
      price: product.price,
      image: product.image,
      color,
      quantity,
    });

    router.push("/checkout");
  };

  return (
    <main className="min-h-screen bg-[#f7f7f8] pt-[47px]">

      {/* PRODUCT NAVIGATION BAR */}
      <div
        className={`fixed ${
          isPageScrolled ? "top-20" : "top-30"
        } left-0 z-40 w-full bg-[#ffb900] text-white shadow-sm transition-all duration-300`}
      >
        <div className="mx-auto flex min-h-[47px] max-w-[1400px] items-center justify-center gap-4 px-4 md:gap-10">
          <nav className="flex items-center gap-5 overflow-x-auto whitespace-nowrap text-xs font-semibold md:gap-10 md:text-sm">
            <a href="#features" className="hover:text-black">
              Features
            </a>

            <a href="#videos" className="hover:text-black">
              Videos
            </a>

            <a href="#parts" className="hover:text-black">
              Parts
            </a>

            <a href="#manual" className="hover:text-black">
              Manual
            </a>
          </nav>

          <span className="whitespace-nowrap text-base font-bold md:text-xl">
            {money(totalPrice)}
          </span>

          <button
            onClick={handleAddToCart}
            className="whitespace-nowrap rounded-full bg-[#17345f] px-4 py-1.5 text-xs font-semibold text-white hover:bg-black md:px-5 md:text-sm"
          >
            Add to cart
          </button>
        </div>
      </div>

      {/* BREADCRUMB */}
      <div className="flex flex-wrap items-center gap-2 px-4 py-3 text-xs text-gray-500">
        <Link href="/" className="transition-colors hover:text-[#ff9900]">
          Home
        </Link>

        <span>/</span>

        <Link
          href="/productpage"
          className="transition-colors hover:text-[#ff9900]"
        >
          RC Cars & Trucks
        </Link>

        <span>/</span>

        <span className="text-gray-800">{product.name}</span>
      </div>

      {/* MAIN LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,56fr)_minmax(0,44fr)] lg:gap-4 lg:h-[calc(100vh-120px)]">

        {/* LEFT SIDE - GALLERY AND PRODUCT INFORMATION */}
        <section className="order-1 lg:order-1 lg:overflow-y-auto lg:pb-6 lg:pl-3 lg:pr-5">

          {/* PRODUCT GALLERY */}
          <div className="grid grid-cols-[65px_1fr] gap-3 bg-white p-3 sm:grid-cols-[75px_1fr]">

            {/* THUMBNAILS */}
            <div className="flex flex-col items-center">
              <button
                onClick={() => scrollThumbnails("up")}
                className="flex h-7 w-full items-center justify-center text-gray-500 hover:text-black"
                aria-label="Scroll thumbnails up"
              >
                <ChevronUp size={18} />
              </button>

              <div
                ref={thumbnailRef}
                className="flex max-h-[390px] w-full flex-col items-center gap-2 overflow-y-auto scroll-smooth"
                style={{ scrollbarWidth: "none" }}
              >
                {gallery.map((image, index) => (
                  <button
                    key={image}
                    onClick={() => setActiveImage(index)}
                    className={`w-full flex-shrink-0 overflow-hidden rounded-sm border transition-colors ${
                      activeImage === index
                        ? "border-[#ff9900]"
                        : "border-gray-200 hover:border-gray-400"
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${product.name} thumbnail ${index + 1}`}
                      className="h-[65px] w-full object-cover sm:h-[75px]"
                    />
                  </button>
                ))}
              </div>

              <button
                onClick={() => scrollThumbnails("down")}
                className="flex h-7 w-full items-center justify-center text-gray-500 hover:text-black"
                aria-label="Scroll thumbnails down"
              >
                <ChevronDown size={18} />
              </button>
            </div>

            {/* MAIN IMAGE */}
            <div className="group relative flex min-h-[300px] min-w-0 items-center justify-center overflow-hidden bg-white sm:min-h-[350px]">
              <button
                onClick={openZoom}
                className="flex w-full cursor-zoom-in items-center justify-center"
                aria-label="Open product image zoom"
              >
                {currentImage && (
                  <img
                    src={currentImage}
                    alt={product.name}
                    className="max-h-[420px] w-full object-contain transition-transform duration-300 group-hover:scale-[1.02]"
                  />
                )}
              </button>

              <button
                onClick={openZoom}
                className="absolute bottom-3 right-3 rounded-full border bg-white p-3 shadow-sm transition-colors hover:bg-gray-100"
                aria-label="Zoom image"
              >
                <ZoomIn size={19} />
              </button>
            </div>
          </div>

          {/* FULL SCREEN ZOOM */}
          {isZoomOpen && (
            <div
              className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95"
              onClick={closeZoom}
            >
              <button
                onClick={closeZoom}
                className="absolute right-5 top-5 z-30 rounded-full bg-white/10 p-3 text-white hover:bg-white/20"
                aria-label="Close image viewer"
              >
                <X size={25} />
              </button>

              <div className="absolute left-1/2 top-7 z-20 -translate-x-1/2 text-sm text-white">
                {activeImage + 1} / {gallery.length}
              </div>

              <button
                onClick={(event) => {
                  event.stopPropagation();
                  previousImage();
                }}
                className="absolute left-3 top-1/2 z-20 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white hover:bg-white/25 md:left-8"
                aria-label="Previous image"
              >
                <ChevronLeft size={28} />
              </button>

              <div
                className="flex h-full w-full items-center justify-center overflow-auto p-6"
                onClick={(event) => event.stopPropagation()}
              >
                <img
                  src={currentImage}
                  alt={product.name}
                  draggable={false}
                  style={{
                    transform: `scale(${zoom})`,
                    transition: "transform 200ms ease",
                  }}
                  className="max-h-[80vh] max-w-[85vw] object-contain"
                />
              </div>

              <button
                onClick={(event) => {
                  event.stopPropagation();
                  nextImage();
                }}
                className="absolute right-3 top-1/2 z-20 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white hover:bg-white/25 md:right-8"
                aria-label="Next image"
              >
                <ChevronRight size={28} />
              </button>

              <div className="absolute bottom-6 left-1/2 z-20 flex -translate-x-1/2 items-center gap-4 rounded-full bg-white/10 px-5 py-3 backdrop-blur-md">
                <button
                  onClick={(event) => {
                    event.stopPropagation();
                    setZoom((prev) => Math.max(1, prev - 0.25));
                  }}
                  disabled={zoom <= 1}
                  className="text-white hover:text-[#ffb900] disabled:opacity-30"
                  aria-label="Zoom out"
                >
                  <ZoomOut size={23} />
                </button>

                <span className="min-w-[45px] text-center text-sm text-white">
                  {Math.round(zoom * 100)}%
                </span>

                <button
                  onClick={(event) => {
                    event.stopPropagation();
                    setZoom((prev) => Math.min(3, prev + 0.25));
                  }}
                  disabled={zoom >= 3}
                  className="text-white hover:text-[#ffb900] disabled:opacity-30"
                  aria-label="Zoom in"
                >
                  <ZoomIn size={23} />
                </button>

                <button
                  onClick={(event) => {
                    event.stopPropagation();
                    setZoom(1);
                  }}
                  className="border-l border-white/30 pl-4 text-xs text-white hover:text-[#ffb900]"
                >
                  Reset
                </button>
              </div>
            </div>
          )}

          {/* TOP HIGHLIGHTS */}
          <div className="mt-5 bg-white p-5">
            <h2 className="mb-5 text-center text-xl font-bold">
              Top Highlights
            </h2>

            <ul className="list-disc space-y-2 pl-5 text-sm text-gray-700">
              {product.details.highlights.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>

          {/* DESCRIPTION */}
          <div className="mt-5 bg-white p-5">
            <h2 className="mb-5 text-center text-xl font-bold">
              Description
            </h2>

            <h3 className="mb-2 text-sm font-semibold">Introduction:</h3>

            <p className="text-sm leading-6 text-gray-600">
              {product.details.description}
            </p>
          </div>

          {/* FEATURES */}
          <div id="features" className="mt-5 scroll-mt-32 bg-white p-5">
            <h2 className="mb-5 text-center text-xl font-bold">
              Features
            </h2>

            <div className="grid grid-cols-2 gap-5">
              {product.details.features.map((item, index) => (
                <div key={index}>
                  <img
                    src={item.image}
                    alt={item.title}
                    className="aspect-[4/3] w-full object-cover"
                  />

                  <h3 className="mt-3 text-sm font-semibold">
                    {item.title}
                  </h3>

                  <p className="mt-2 text-xs leading-5 text-gray-600">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* VIDEOS */}
          <div
            id="videos"
            className="mt-5 scroll-mt-32 bg-white p-6 text-center"
          >
            <h2 className="mb-5 text-xl font-bold">Videos</h2>

            <p className="text-sm">
              More Videos Please Go To Our YouTube Channel:
              <a
                href="https://www.youtube.com/"
                target="_blank"
                rel="noreferrer"
                className="ml-1 font-semibold underline"
              >
                FMS Model
              </a>
            </p>
          </div>

          {/* PARTS */}
          <div id="parts" className="mt-5 scroll-mt-32 bg-white p-5">
            <h2 className="mb-5 text-center text-xl font-bold">
              Parts
            </h2>

            {product.details.parts.length > 0 ? (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                {product.details.parts.map((part, index) => (
                  <div key={index} className="cursor-pointer">
                    <img
                      src={part.image}
                      alt={part.title}
                      className="aspect-square w-full bg-gray-100 object-cover"
                    />

                    <p className="mt-2 text-xs leading-4">
                      {part.title}
                    </p>

                    <p className="mt-2 text-xs text-red-500">
                      {money(part.price)}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="py-6 text-center text-sm text-gray-500">
                Parts information is not available for this product yet.
              </p>
            )}
          </div>

          {/* MANUAL & SUPPORT */}
          <div id="manual" className="mt-5 scroll-mt-32 bg-white p-5">
            <h2 className="mb-5 text-center text-xl font-bold">
              Manual & Support
            </h2>

            <div className="mx-auto max-w-sm space-y-3">
              {[
                "Quick Start Guide",
                "Manual",
                "Troubleshooting Guide",
                "Part Finder",
              ].map((item, index) => (
                <button
                  key={index}
                  type="button"
                  className="flex w-full items-center justify-center gap-2 rounded-md border border-[#31558b] py-2 text-sm text-[#31558b] transition-colors hover:bg-blue-50"
                >
                  <FileText size={14} />
                  {item}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* RIGHT SIDE - PRODUCT DETAILS */}
        <aside className="order-2 bg-white p-5 lg:order-2 lg:overflow-y-auto lg:pr-6">
          <h1 className="text-2xl font-semibold leading-8">
            {product.name}
          </h1>

          <p className="mt-3 text-xs text-gray-500">
            SKU: {product.details.sku}
          </p>

          {product.badge && (
            <span className="mt-3 inline-block rounded bg-[#172c52] px-3 py-1 text-xs text-white">
              {product.badge}
            </span>
          )}

          {/* STOCK */}
          <p
            className={`mt-4 flex items-center gap-2 text-sm font-semibold ${
              product.stock === "In stock"
                ? "text-emerald-600"
                : "text-orange-500"
            }`}
          >
            <span className="h-2 w-2 rounded-full bg-current" />
            {product.stock}
          </p>

          {/* WISHLIST */}
          <div className="mt-5">
            <button
              onClick={() => setLiked((prev) => !prev)}
              className="flex items-center gap-2 rounded-full border px-4 py-2 text-sm"
            >
              <Heart
                size={15}
                fill={liked ? "red" : "none"}
                color={liked ? "red" : "currentColor"}
              />
              {liked ? "Added to Wishlist" : "Add to Wishlist"}
            </button>
          </div>

          {/* COLOR */}
          <div className="mt-8 border-b pb-5">
            <p className="mb-3 text-sm">Color: {color}</p>

            <div className="flex gap-3">
              {[
                { name: "Black", bg: "#222222" },
                { name: "Blue", bg: "#7595a7" },
                { name: "Gray", bg: "#888888" },
              ].map((item) => (
                <button
                  key={item.name}
                  onClick={() => setColor(item.name)}
                  title={item.name}
                  style={{ backgroundColor: item.bg }}
                  className={`h-10 w-10 rounded-full border-2 ${
                    color === item.name
                      ? "border-[#ff9900] ring-2 ring-gray-200"
                      : "border-gray-300"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* PRICE */}
          <div className="border-b py-5">
            <p className="text-2xl font-medium text-[#ff4b24]">
              {money(totalPrice)}
            </p>

            {product.oldPrice !== undefined && (
              <p className="mt-1 text-sm text-gray-500 line-through">
                {money(product.oldPrice * quantity)}
              </p>
            )}
          </div>

          {/* QUANTITY */}
          <div className="space-y-4 border-b py-5">
            <div>
              <p className="mb-2 text-sm font-semibold">Quantity</p>

              <div className="flex w-fit items-center overflow-hidden rounded border">
                <button
                  type="button"
                  onClick={() =>
                    setQuantity((prev) => Math.max(1, prev - 1))
                  }
                  disabled={quantity <= 1}
                  className="px-4 py-2 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label="Decrease quantity"
                >
                  -
                </button>

                <span className="min-w-12 px-4 py-2 text-center">
                  {quantity}
                </span>

                <button
                  type="button"
                  onClick={() => setQuantity((prev) => prev + 1)}
                  className="px-4 py-2 transition-colors hover:bg-gray-100"
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>
            </div>

            <p className="text-sm text-gray-500">
              Subtotal:{" "}
              <span className="font-semibold text-black">
                {money(totalPrice)}
              </span>
            </p>

            {/* ADD TO CART */}
            <button
              onClick={handleAddToCart}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-[#ff9900] py-3 font-semibold transition-colors hover:bg-orange-500"
            >
              <ShoppingCart size={18} />
              Add to Cart
            </button>

            {/* BUY NOW */}
            <button
              onClick={handleBuyNow}
              className="w-full rounded-full bg-black py-3 font-semibold text-white transition-colors hover:bg-gray-800"
            >
              Buy It Now
            </button>
          </div>

          {/* SHIPPING */}
          <div className="space-y-5 py-6 text-sm">
            <div className="flex gap-3">
              <Truck size={20} />

              <div>
                <p className="font-semibold">Shipping Information</p>

                <p className="mt-1 text-gray-500">
                  Free shipping special for you.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <FileText size={20} />

              <div>
                <p className="font-semibold">
                  Product Specifications
                </p>

                <div className="mt-2 space-y-2 text-gray-500">
                  {product.details.specifications.map((item) => (
                    <p key={item.label}>
                      {item.label}: {item.value}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* PRODUCT DETAILS */}
          <div className="border-t py-5">
            <h3 className="mb-3 font-bold">Product Details</h3>

            <p className="text-sm leading-6 text-gray-600">
              {product.details.description}
            </p>
          </div>

          {/* SPECIFICATIONS TABLE */}
          <div className="border-t py-5">
            <h3 className="mb-3 font-bold">Specifications</h3>

            {product.details.specifications.map((item) => (
              <div
                key={item.label}
                className="flex justify-between gap-4 border-b py-3 text-sm"
              >
                <span className="text-gray-500">{item.label}</span>

                <span className="text-right">{item.value}</span>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </main>
  );
}

export default function ProductPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-[#f7f7f8]">
          <p className="text-sm text-gray-500">Loading product...</p>
        </main>
      }
    >
      <ProductDetailsPage />
    </Suspense>
  );
}
