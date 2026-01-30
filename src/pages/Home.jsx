import { useQuery } from '@tanstack/react-query'
import { Star } from 'lucide-react'
import { useProducts } from '../hooks/useProducts'
import ProductGrid from '../components/product/ProductGrid'
import { getTestimonials } from '../services/testimonials'

function Home() {
  const { data: featuredProducts, isLoading: productsLoading, error: productsError } = useProducts({ featured: true })
  const { data: onSaleProducts, isLoading: saleLoading } = useProducts({ onSale: true })

  const { data: testimonials } = useQuery({
    queryKey: ['testimonials', 'featured'],
    queryFn: () => getTestimonials({ featured: true })
  })

  return (
    <div className="bg-gray-50 dark:bg-gray-900">
      {/* On Sale Section */}
      {onSaleProducts && onSaleProducts.length > 0 && (
        <section className="py-16 bg-yellow-50 dark:bg-gray-800">
          <div className="container mx-auto px-4">
            <div className="text-center mb-8">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
                🔥 On Sale Now!
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Limited time offers - Grab them while they last!
              </p>
            </div>
            <ProductGrid products={onSaleProducts} loading={saleLoading} />
          </div>
        </section>
      )}

      {/* Featured Products Section */}
      <section id="featured" className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
              Featured Products
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Check out our handpicked selection
            </p>
          </div>
          <ProductGrid products={featuredProducts} loading={productsLoading} error={productsError} />
        </div>
      </section>

      {/* Testimonials Section */}
      {testimonials && testimonials.length > 0 && (
        <section className="py-16 bg-white dark:bg-gray-800">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
                What Our Customers Say
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Real reviews from real customers
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {testimonials.slice(0, 6).map((testimonial) => (
                <div
                  key={testimonial.id}
                  className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 shadow-md"
                >
                  {/* Rating */}
                  <div className="flex gap-1 mb-3">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-5 h-5 ${
                          i < testimonial.rating
                            ? 'text-yellow-400 fill-yellow-400'
                            : 'text-gray-300 dark:text-gray-600'
                        }`}
                      />
                    ))}
                  </div>

                  {/* Comment */}
                  <p className="text-gray-700 dark:text-gray-300 mb-4 italic">
                    "{testimonial.comment}"
                  </p>

                  {/* Customer Name */}
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {testimonial.customer_name}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  )
}

export default Home
