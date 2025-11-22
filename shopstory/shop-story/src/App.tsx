import {usePopularProducts, ProductCard, List} from '@shopify/shop-minis-react'

export function App() {
  const {products, fetchMore} = usePopularProducts()

  const productRows = products
    ? Array.from({length: Math.ceil(products.length / 2)}, (_, i) =>
        products.slice(i * 2, i * 2 + 2)
      )
    : []

  return (
    <div className="pt-12 px-4 pb-6">
      <h1 className="text-2xl font-bold mb-2 text-center">
        Welcome to Shop Minis!
      </h1>
      <p className="text-xs text-blue-600 mb-4 text-center bg-blue-50 py-2 px-4 rounded border border-blue-200">
        🛠️ Edit <b>src/App.tsx</b> to change this screen and come back to see
        your edits!
      </p>
      <p className="text-base text-gray-600 mb-6 text-center">
        These are the popular products today
      </p>
      <List
        items={productRows}
        height={600}
        showScrollbar={true}
        fetchMore={fetchMore}
        renderItem={productRow => (
          <div className="grid grid-cols-2 gap-4 p-4">
            {productRow.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      />
    </div>
  )
}
