import { useState } from 'react'
import './App.css'

function App() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [products, setProducts] = useState([])
  const [loggedIn, setLoggedIn] = useState(false)
  const [message, setMessage] = useState('')

  const [productName, setProductName] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [quantity, setQuantity] = useState('')

  const [editingId, setEditingId] = useState(null)

  // PAGE
  const [currentPage, setCurrentPage] = useState('products')

  // LOGIN
  const handleLogin = async (e) => {
    e.preventDefault()
    setMessage('')

    try {
      const response = await fetch('http://127.0.0.1:3000/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: username,
          password: password
        })
      })

      const data = await response.json()

      if (!response.ok) {
        setMessage(data.error || 'Login failed')
        return
      }

      localStorage.setItem('access_token', data.access_token)

      setLoggedIn(true)
      setCurrentPage('products')
      setMessage('Login successful')

      await getProducts(data.access_token)

    } catch (error) {
      console.error(error)
      setMessage('Unable to connect to API')
    }
  }

  // GET PRODUCTS
  const getProducts = async (token) => {
    try {
      const response = await fetch('http://127.0.0.1:3000/products', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const data = await response.json()

      if (!response.ok) {
        setMessage(data.error || 'Unable to get products')
        return
      }

      setProducts(data.data)

    } catch (error) {
      console.error(error)
      setMessage('Unable to load products')
    }
  }

  // ADD PRODUCT
  const handleAddProduct = async (e) => {
    e.preventDefault()

    const token = localStorage.getItem('access_token')

    try {
      const response = await fetch('http://127.0.0.1:3000/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          product_name: productName,
          description: description,
          price: price,
          quantity: quantity
        })
      })

      const data = await response.json()

      if (!response.ok) {
        setMessage(data.error || 'Unable to add product')
        return
      }

      clearForm()
      setMessage('Product added successfully')
      setCurrentPage('products')

      await getProducts(token)

    } catch (error) {
      console.error(error)
      setMessage('Unable to connect to API')
    }
  }

  // OPEN ADD PRODUCT PAGE
  const openAddProduct = () => {
    clearForm()
    setMessage('')
    setCurrentPage('add')
  }

  // SELECT PRODUCT FOR EDIT
  const handleEditClick = (product) => {
    setEditingId(product.id)
    setProductName(product.product_name)
    setDescription(product.description)
    setPrice(product.price)
    setQuantity(product.quantity)
    setMessage('')
    setCurrentPage('edit')
  }

  // UPDATE PRODUCT
  const handleUpdateProduct = async (e) => {
    e.preventDefault()

    const token = localStorage.getItem('access_token')

    try {
      const response = await fetch(
        `http://127.0.0.1:3000/products/${editingId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            product_name: productName,
            description: description,
            price: price,
            quantity: quantity
          })
        }
      )

      const data = await response.json()

      if (!response.ok) {
        setMessage(data.error || 'Unable to update product')
        return
      }

      clearForm()
      setMessage('Product updated successfully')
      setCurrentPage('products')

      await getProducts(token)

    } catch (error) {
      console.error(error)
      setMessage('Unable to connect to API')
    }
  }

  // DELETE PRODUCT
  const handleDeleteProduct = async (id) => {
    const product = products.find((item) => item.id === id)

    if (!product) {
      return
    }

    const confirmDelete = window.confirm(
      `Are you sure you want to delete "${product.product_name}"?`
    )

    if (!confirmDelete) {
      return
    }

    const token = localStorage.getItem('access_token')

    try {
      const response = await fetch(
        `http://127.0.0.1:3000/products/${id}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      )

      const data = await response.json()

      if (!response.ok) {
        setMessage(data.error || 'Unable to delete product')
        return
      }

      setMessage('Product deleted successfully')

      await getProducts(token)

    } catch (error) {
      console.error(error)
      setMessage('Unable to connect to API')
    }
  }

  // CLEAR FORM
  const clearForm = () => {
    setEditingId(null)
    setProductName('')
    setDescription('')
    setPrice('')
    setQuantity('')
  }

  // BACK TO PRODUCT LIST
  const backToProducts = () => {
    clearForm()
    setMessage('')
    setCurrentPage('products')
  }

  // LOGOUT
  const handleLogout = () => {
    localStorage.removeItem('access_token')

    setLoggedIn(false)
    setProducts([])
    setMessage('')
    setUsername('')
    setPassword('')
    setCurrentPage('products')

    clearForm()
  }

  return (
    <div className="app-container">

      <h1 className="app-title">
        🛒 Grocery Product Management
      </h1>

      {!loggedIn ? (

        <div className="login-card">

          <div className="login-icon">
            🛒
          </div>

          <h2>
            Welcome to Grocery Management
          </h2>

          <p className="login-subtitle">
            Please login to manage your products
          </p>

          <form onSubmit={handleLogin}>

            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <button
              type="submit"
              className="login-button"
            >
              Login
            </button>

          </form>

          {message && (
            <p className="message">
              {message}
            </p>
          )}

        </div>

      ) : (

        <>

          <div className="dashboard-header">

            <div>
              <h2>
                {currentPage === 'products'
                  ? 'Product List'
                  : currentPage === 'add'
                    ? 'Add Product'
                    : 'Edit Product'}
              </h2>

              <p>
                Manage your grocery products
              </p>
            </div>

            <button
              type="button"
              className="logout-button"
              onClick={handleLogout}
            >
              Logout
            </button>

          </div>

          {message && (
            <p className="message">
              {message}
            </p>
          )}

          {/* PRODUCT LIST PAGE */}

          {currentPage === 'products' && (

            <>

              <div className="product-page-actions">

                <h2 className="product-list-title">
                  Available Products
                </h2>

                <button
                  type="button"
                  className="add-product-button"
                  onClick={openAddProduct}
                >
                  + Add Product
                </button>

              </div>

              <div className="product-table-container">

                <table className="product-table">

                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Product Name</th>
                      <th>Description</th>
                      <th>Price</th>
                      <th>Quantity</th>
                      <th>Created At</th>
                      <th>Actions</th>
                    </tr>
                  </thead>

                  <tbody>

                    {products.map((product) => (

                      <tr key={product.id}>

                        <td>
                          {product.id}
                        </td>

                        <td>
                          {product.product_name}
                        </td>

                        <td>
                          {product.description}
                        </td>

                        <td>
                          ₱{Number(product.price).toFixed(2)}
                        </td>

                        <td>
                          {product.quantity}
                        </td>

                        <td>
                          {product.created_at
                            ? new Date(
                                product.created_at
                              ).toLocaleDateString()
                            : ''}
                        </td>

                        <td className="action-buttons">

                          <button
                            type="button"
                            onClick={() =>
                              handleEditClick(product)
                            }
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              handleDeleteProduct(product.id)
                            }
                          >
                            Delete
                          </button>

                        </td>

                      </tr>

                    ))}

                  </tbody>

                </table>

              </div>

            </>

          )}

          {/* ADD PRODUCT PAGE */}

          {currentPage === 'add' && (

            <div className="product-page">

              <h2 className="form-title">
                Add Product
              </h2>

              <form
                className="product-form"
                onSubmit={handleAddProduct}
              >

                <input
                  type="text"
                  placeholder="Product Name"
                  value={productName}
                  onChange={(e) =>
                    setProductName(e.target.value)
                  }
                  required
                />

                <input
                  type="text"
                  placeholder="Description"
                  value={description}
                  onChange={(e) =>
                    setDescription(e.target.value)
                  }
                  required
                />

                <input
                  type="number"
                  placeholder="Price"
                  value={price}
                  onChange={(e) =>
                    setPrice(e.target.value)
                  }
                  required
                />

                <input
                  type="number"
                  placeholder="Quantity"
                  value={quantity}
                  onChange={(e) =>
                    setQuantity(e.target.value)
                  }
                  required
                />

                <button type="submit">
                  Add Product
                </button>

                <button
                  type="button"
                  onClick={backToProducts}
                >
                  Cancel
                </button>

              </form>

            </div>

          )}

          {/* EDIT PRODUCT PAGE */}

          {currentPage === 'edit' && (

            <div className="product-page">

              <h2 className="form-title">
                Edit Product
              </h2>

              <form
                className="product-form"
                onSubmit={handleUpdateProduct}
              >

                <input
                  type="text"
                  placeholder="Product Name"
                  value={productName}
                  onChange={(e) =>
                    setProductName(e.target.value)
                  }
                  required
                />

                <input
                  type="text"
                  placeholder="Description"
                  value={description}
                  onChange={(e) =>
                    setDescription(e.target.value)
                  }
                  required
                />

                <input
                  type="number"
                  placeholder="Price"
                  value={price}
                  onChange={(e) =>
                    setPrice(e.target.value)
                  }
                  required
                />

                <input
                  type="number"
                  placeholder="Quantity"
                  value={quantity}
                  onChange={(e) =>
                    setQuantity(e.target.value)
                  }
                  required
                />

                <button type="submit">
                  Update Product
                </button>

                <button
                  type="button"
                  onClick={backToProducts}
                >
                  Cancel
                </button>

              </form>

            </div>

          )}

        </>

      )}

    </div>
  )
}

export default App