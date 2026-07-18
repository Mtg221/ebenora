import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import DemoBanner from './components/DemoBanner'
import HomePage from './pages/HomePage'
import GalleryPage from './pages/GalleryPage'
import PaintingPage from './pages/PaintingPage'
import CartPage from './pages/CartPage'
import CheckoutPage from './pages/CheckoutPage'
import ConfirmationPage from './pages/ConfirmationPage'
import AboutPage from './pages/AboutPage'
import AdminPage from './pages/AdminPage'
import NotFoundPage from './pages/NotFoundPage'

export default function App() {
  return (
    <>
      <DemoBanner />
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/galerie" element={<GalleryPage />} />
          <Route path="/tableau/:id" element={<PaintingPage />} />
          <Route path="/panier" element={<CartPage />} />
          <Route path="/commande" element={<CheckoutPage />} />
          <Route path="/confirmation" element={<ConfirmationPage />} />
          <Route path="/a-propos" element={<AboutPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      <Footer />
    </>
  )
}
