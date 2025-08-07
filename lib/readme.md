# TanStack Query API Documentation

## 🎯 Which Version Should You Use?

### ✅ **Recommended: Simplified Version**
**Best for:** 90% of projects, teams that want maintainable code, rapid development

**Pros:**
- 📚 **Easy to learn** - Developers can be productive in minutes
- 🔧 **Less maintenance** - Fewer abstractions mean fewer things to break
- 🚀 **Faster development** - Simple patterns, less boilerplate
- 👥 **Team friendly** - New developers can understand and contribute quickly
- 🐛 **Easier debugging** - Straightforward code paths
- 📦 **Smaller bundle** - Less code means smaller build size

**Cons:**
- Less granular cache control
- Fewer advanced optimization hooks

### ⚡ **Advanced Version**
**Best for:** Large enterprise apps, performance-critical applications, complex data relationships

**Pros:**
- 🎯 **Maximum control** - Fine-grained cache management
- 📈 **Advanced optimizations** - Infinite queries, prefetching, optimistic updates
- 🏗️ **Enterprise patterns** - Query key factories, error boundaries
- 🔍 **Detailed monitoring** - More hooks for analytics and debugging

**Cons:**
- Steeper learning curve
- More code to maintain
- Can be overkill for simple apps

---

## 📖 Simplified Version Documentation

### 🚀 Quick Start

```tsx
import { 
  useCategories, 
  useCreateCategory, 
  useProducts, 
  useUploadImages 
} from './api-hooks';

function MyComponent() {
  // Query data
  const { data: categories, isLoading } = useCategories();
  const { data: products } = useProducts({ categoryId: 'electronics' });
  
  // Mutations
  const createCategory = useCreateCategory({
    onSuccess: () => alert('Category created!'),
  });
  
  return (
    <div>
      {isLoading ? 'Loading...' : categories?.map(cat => <div key={cat.id}>{cat.name}</div>)}
      <button onClick={() => createCategory.mutate({ name: 'New Category' })}>
        Create Category
      </button>
    </div>
  );
}
```

### 📋 Available Hooks

#### **Query Hooks**
```tsx
// Categories
const { data, isLoading, error } = useCategories(options?);
const { data } = useCategory(id, options?);

// Products
const { data } = useProducts(filters?, options?);
const { data } = useProduct(id, options?);

// Orders
const { data } = useOrders(options?);
const { data } = useOrder(id, options?);
```

#### **Mutation Hooks**
```tsx
// Categories
const mutation = useCreateCategory(options?);
const mutation = useUpdateCategory(options?);
const mutation = useDeleteCategory(options?);

// Products
const mutation = useCreateProduct(options?);
const mutation = useUpdateProduct(options?);
const mutation = useDeleteProduct(options?);

// Orders
const mutation = useCreateOrder(options?);
const mutation = useUpdateOrder(options?);
const mutation = useDeleteOrder(options?);

// Upload
const mutation = useUploadImages(options?);
```

#### **Utility Hooks**
```tsx
const refetch = useRefetch();

// Usage
refetch.categories(); // Refetch all categories
refetch.products();   // Refetch all products
refetch.orders();     // Refetch all orders
refetch.all();        // Refetch everything
```

### 💡 Common Usage Patterns

#### **Basic CRUD Operations**
```tsx
function ProductManager() {
  const { data: products, isLoading } = useProducts();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();

  const handleCreate = (productData) => {
    createProduct.mutate(productData, {
      onSuccess: () => toast.success('Product created!'),
      onError: (error) => toast.error(error.message),
    });
  };

  const handleUpdate = (id, updates) => {
    updateProduct.mutate({ id, data: updates });
  };

  const handleDelete = (id) => {
    deleteProduct.mutate(id);
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      {products?.map(product => (
        <ProductCard 
          key={product.id}
          product={product}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
        />
      ))}
      <CreateProductForm onSubmit={handleCreate} />
    </div>
  );
}
```

#### **Filtered Queries**
```tsx
function ProductSearch() {
  const [search, setSearch] = useState('');
  const [categoryId, setCategoryId] = useState('');
  
  const { data: products } = useProducts({ 
    search, 
    categoryId 
  });

  return (
    <div>
      <input 
        placeholder="Search products..." 
        onChange={(e) => setSearch(e.target.value)} 
      />
      <select onChange={(e) => setCategoryId(e.target.value)}>
        <option value="">All Categories</option>
        {/* category options */}
      </select>
      
      {products?.map(product => <ProductCard key={product.id} product={product} />)}
    </div>
  );
}
```

#### **File Upload**
```tsx
function ImageUploader() {
  const uploadImages = useUploadImages();

  const handleUpload = (files: FileList) => {
    const formData = new FormData();
    Array.from(files).forEach(file => formData.append('images', file));
    
    uploadImages.mutate(formData, {
      onSuccess: (response) => {
        console.log('Uploaded URLs:', response.urls);
      },
      onError: (error) => {
        alert('Upload failed: ' + error.message);
      }
    });
  };

  return (
    <input 
      type="file" 
      multiple 
      onChange={(e) => e.target.files && handleUpload(e.target.files)}
    />
  );
}
```

#### **Custom Options**
```tsx
// Disable refetching on window focus
const { data } = useProducts({}, { 
  refetchOnWindowFocus: false 
});

// Custom retry logic
const { data } = useCategory(id, {
  retry: (failureCount, error) => {
    if (error.message.includes('404')) return false;
    return failureCount < 3;
  }
});

// Custom stale time
const { data } = useOrders({ 
  staleTime: 10 * 1000 // 10 seconds
});
```

---

## 🏗️ Advanced Version Documentation

### 🚀 Advanced Features

#### **Query Key Factory**
```tsx
import { queryKeys } from './api-hooks';

// Invalidate all products
queryClient.invalidateQueries({ queryKey: queryKeys.products() });

// Invalidate specific product
queryClient.invalidateQueries({ queryKey: queryKeys.product('123') });

// Invalidate products by category
queryClient.invalidateQueries({ queryKey: queryKeys.productsByCategory('electronics') });
```

#### **Infinite Queries**
```tsx
function InfiniteProductList() {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteProducts({ categoryId: 'electronics' });

  return (
    <div>
      {data?.pages.map(page => 
        page.data.map(product => (
          <ProductCard key={product.id} product={product} />
        ))
      )}
      
      {hasNextPage && (
        <button 
          onClick={() => fetchNextPage()}
          disabled={isFetchingNextPage}
        >
          {isFetchingNextPage ? 'Loading...' : 'Load More'}
        </button>
      )}
    </div>
  );
}
```

#### **Prefetching for Better UX**
```tsx
function ProductGrid() {
  const prefetchProduct = usePrefetchProduct();
  const { data: products } = useProducts();

  return (
    <div>
      {products?.map(product => (
        <div 
          key={product.id}
          onMouseEnter={() => prefetchProduct(product.id)}
        >
          <Link to={`/products/${product.id}`}>
            {product.name}
          </Link>
        </div>
      ))}
    </div>
  );
}
```

#### **Optimistic Updates**
```tsx
function QuickProductUpdater() {
  const optimistic = useOptimisticUpdate();
  const updateProduct = useUpdateProduct();

  const handleQuickUpdate = (id: string, updates: Partial<Product>) => {
    // Immediately update UI
    optimistic.updateProduct(id, updates);
    
    // Send request
    updateProduct.mutate({ id, data: updates }, {
      onError: () => {
        // Revert on error
        queryClient.invalidateQueries({ queryKey: queryKeys.product(id) });
      }
    });
  };

  return (
    <button onClick={() => handleQuickUpdate('123', { featured: true })}>
      Mark as Featured
    </button>
  );
}
```

#### **Advanced Error Handling**
```tsx
import { ApiError } from './api-hooks';

function ProductForm() {
  const createProduct = useCreateProduct({
    onError: (error) => {
      if (error instanceof ApiError) {
        if (error.status === 409) {
          toast.error('Product name already exists');
        } else if (error.status === 422) {
          toast.error('Invalid product data');
        }
      }
    }
  });
}
```

---

## 🛠️ Setup Instructions

### 1. Install Dependencies
```bash
npm install @tanstack/react-query
```

### 2. Setup Query Client
```tsx
// main.tsx or App.tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <YourApp />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
```

### 3. Update Your Types
```tsx
// types/index.ts
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
}

export interface Product<TPopulated = false> {
  id: string;
  name: string;
  price: number;
  categoryId: string;
  category?: TPopulated extends true ? Category : never;
  images?: string[];
  createdAt: string;
}

export interface Order<TPopulated = false> {
  id: string;
  customerId: string;
  items: OrderItem[];
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered';
  createdAt: string;
}
```

---

## 🎯 Best Practices

### ✅ Do's
- Use the simplified version for most projects
- Add custom options only when needed
- Handle loading and error states
- Use TypeScript for better DX
- Implement proper error boundaries

### ❌ Don'ts
- Don't over-engineer with advanced features unless needed
- Don't ignore error handling
- Don't fetch data in useEffect when you have these hooks
- Don't forget to handle loading states

---

## 🔧 Migration Guide

### From useEffect + fetch
```tsx
// ❌ Old way
const [data, setData] = useState([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
  fetch('/api/categories')
    .then(res => res.json())
    .then(setData)
    .finally(() => setLoading(false));
}, []);

// ✅ New way
const { data, isLoading } = useCategories();
```

### From Redux/Context
```tsx
// ❌ Old way - lots of boilerplate
const dispatch = useDispatch();
const { products, loading } = useSelector(state => state.products);

useEffect(() => {
  dispatch(fetchProducts());
}, []);

// ✅ New way - one line
const { data: products, isLoading: loading } = useProducts();
```

---

## 🎉 Conclusion

**For most projects, use the simplified version.** It provides 90% of the benefits with 10% of the complexity. You can always migrate to the advanced version later if needed.

The simplified version gives you:
- Automatic caching and background refetching
- Optimistic UI updates
- Error handling
- Loading states
- Type safety
- Easy testing

All with minimal setup and maximum productivity! 🚀