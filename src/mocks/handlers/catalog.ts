import { http, HttpResponse } from "msw";
import { ENDPOINTS } from "@/lib/api/endpoints";
import { mockPath } from "@/mocks/handlers/paths";
import { mockArticles, mockCategories, mockSlides } from "@/mocks/data/content";
import { mockProductDetails } from "@/mocks/data/product-details";
import { mockProducts } from "@/mocks/data/products";
import type { Paginated } from "@/types/api";
import type { Product, ProductSuggestion } from "@/types/product";

// Mock products carry only a top-level category, so a sub-category slug resolves to its parent.
function resolveCategory(slug: string) {
  const parent = mockCategories.find((c) => c.children.some((child) => child.slug === slug));
  const top = mockCategories.find((c) => c.slug === slug);
  return top ?? parent;
}

function matchProducts(params: URLSearchParams) {
  const category = params.get("category");
  const q = params.get("q")?.trim().toLowerCase();
  let items = [...mockProducts];
  if (category) {
    const resolved = resolveCategory(category)?.slug;
    items = items.filter((p) => p.categorySlug === resolved);
  }
  if (q) items = items.filter((p) => p.name.toLowerCase().includes(q));
  return items;
}

function filterProducts(params: URLSearchParams) {
  const min = Number(params.get("minPrice") ?? 0);
  const max = Number(params.get("maxPrice") ?? Infinity);
  const items = matchProducts(params).filter((p) => p.price >= min && p.price <= max);
  if (params.get("sort") === "price-asc") items.sort((a, b) => a.price - b.price);
  if (params.get("sort") === "price-desc") items.sort((a, b) => b.price - a.price);
  if (params.get("sort") === "newest") items.sort((a, b) => Number(b.isNew) - Number(a.isNew));
  if (params.get("sort") === "bestselling") items.sort((a, b) => b.soldCount - a.soldCount);
  return items;
}

const notFound = () => HttpResponse.json({ message: "Not found" }, { status: 404 });

export const catalogHandlers = [
  http.get(mockPath(ENDPOINTS.PRODUCTS), ({ request }) => {
    const params = new URL(request.url).searchParams;
    const page = Number(params.get("page") ?? 1);
    const pageSize = Number(params.get("pageSize") ?? 12);
    const filtered = filterProducts(params);
    const start = (page - 1) * pageSize;

    return HttpResponse.json<Paginated<Product>>({
      items: filtered.slice(start, start + pageSize),
      page,
      pageSize,
      total: filtered.length,
      totalPages: Math.max(1, Math.ceil(filtered.length / pageSize)),
    });
  }),

  // Registered before PRODUCT_BY_SLUG so "filters" is not read as a slug.
  http.get(mockPath(ENDPOINTS.PRODUCT_FILTERS), ({ request }) => {
    const prices = matchProducts(new URL(request.url).searchParams).map((p) => p.price);
    const priceRange = prices.length
      ? { min: Math.min(...prices), max: Math.max(...prices) }
      : { min: 0, max: 0 };
    return HttpResponse.json({ priceRange });
  }),

  http.get(mockPath(ENDPOINTS.PRODUCT_BY_SLUG(":slug")), ({ params }) => {
    const product = mockProductDetails.find((p) => p.slug === params.slug);
    return product ? HttpResponse.json(product) : notFound();
  }),

  http.get(mockPath(ENDPOINTS.PRODUCT_RELATED(":slug")), ({ params }) => {
    const product = mockProducts.find((p) => p.slug === params.slug);
    if (!product) return notFound();
    const related = mockProducts
      .filter((p) => p.slug !== product.slug && p.categorySlug === product.categorySlug)
      .concat(mockProducts.filter((p) => p.categorySlug !== product.categorySlug))
      .slice(0, 4);
    return HttpResponse.json(related);
  }),

  http.get(mockPath(ENDPOINTS.SEARCH_SUGGESTIONS), ({ request }) => {
    const items = filterProducts(new URL(request.url).searchParams)
      .slice(0, 5)
      .map<ProductSuggestion>(({ slug, name, categoryName, price, image }) => ({
        slug,
        name,
        categoryName,
        price,
        image,
      }));
    return HttpResponse.json(items);
  }),

  http.get(mockPath(ENDPOINTS.CATEGORIES), () => HttpResponse.json(mockCategories)),

  http.get(mockPath(ENDPOINTS.CATEGORY_BY_SLUG(":slug")), ({ params }) => {
    const top = mockCategories.find((c) => c.slug === params.slug);
    if (top) return HttpResponse.json(top);
    const parent = mockCategories.find((c) => c.children.some((child) => child.slug === params.slug));
    const child = parent?.children.find((c) => c.slug === params.slug);
    if (!parent || !child) return notFound();
    return HttpResponse.json({
      slug: child.slug,
      name: child.name,
      description: `${child.name} from our ${parent.name} range.`,
      image: parent.image,
      productCount: 0,
      children: [],
      parent: { slug: parent.slug, name: parent.name },
    });
  }),

  http.get(mockPath(ENDPOINTS.HERO_BANNERS), () => HttpResponse.json(mockSlides)),
  http.get(mockPath(ENDPOINTS.BLOG_POSTS), () => HttpResponse.json(mockArticles)),

  http.get(mockPath(ENDPOINTS.BLOG_POST_BY_SLUG(":slug")), ({ params }) => {
    const article = mockArticles.find((a) => a.slug === params.slug);
    return article ? HttpResponse.json(article) : notFound();
  }),
];
