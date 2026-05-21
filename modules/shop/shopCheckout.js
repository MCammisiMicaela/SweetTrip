'use strict';

import ShopCart from './shopCart.js';
import ShopWhatsApp from './shopWhatsApp.js';
import ShopUI from './shopUI.js';
import { escapeHtml } from '../../utils/sanitizer.js';

class ShopCheckout {
  constructor() {
    this.settings = {};
  }

  setSettings(settings) {
    this.settings = settings || {};
  }

  showToast(message, type = 'info') {
    const existing = document.querySelector('.shop-toast');
    if (existing) {
      existing.remove();
    }

    const toast = document.createElement('div');
    toast.className = `shop-toast shop-toast-${type}`;
    toast.innerHTML = `
      <i class="fa-solid fa-${type === 'success' ? 'check' : 'exclamation'}-circle"></i>
      <span>${escapeHtml(message)}</span>
    `;

    document.body.appendChild(toast);

    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, 2000);
  }

  showCheckout() {
    const modal = document.getElementById('shop-modal');
    const modalBody = document.getElementById('shop-modal-body');

    modalBody.innerHTML = ShopUI.renderCheckoutModal();
    modal.classList.add('active');

    this.setupCheckoutEvents();
  }

  setupCheckoutEvents() {
    const form = document.getElementById('shop-checkout-form');
    const backBtn = document.getElementById('shop-back-cart');
    const closeBtn = document.getElementById('shop-close-modal');
    const dayBtns = document.querySelectorAll('#shop-day-selector .shop-order-type-btn');

    dayBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        dayBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      });
    });

    backBtn?.addEventListener('click', () => {
      this.showCart();
    });

    closeBtn?.addEventListener('click', () => {
      this.closeModal();
    });

    form?.addEventListener('submit', e => {
      e.preventDefault();
      this.handleSubmit();
    });
  }

  async handleSubmit() {
    const firstName = document.getElementById('shop-firstname').value.trim();
    const lastName = document.getElementById('shop-lastname').value.trim();
    const phone = document.getElementById('shop-phone').value.trim();
    const dayEl = document.querySelector('#shop-day-selector .shop-order-type-btn.active');
    const deliveryDay = dayEl ? dayEl.dataset.day : '';

    if (!firstName || !lastName || !phone) {
      this.showError('Por favor completá todos los campos obligatorios');
      return;
    }

    if (!deliveryDay) {
      this.showError('Por favor seleccioná el día de entrega');
      return;
    }

    const checkoutData = {
      firstName,
      lastName,
      phone,
      deliveryDay
    };

    try {
      const items = ShopCart.getItems();
      await ShopWhatsApp.sendOrder(checkoutData, items);
      ShopCart.clear();
      this.closeModal();
      this.showSuccess();
    } catch (error) {
      this.showError(error.message || 'Error al enviar el pedido');
    }
  }

  showCart() {
    const modalBody = document.getElementById('shop-modal-body');
    modalBody.innerHTML = ShopUI.renderCartModal();
    this.setupCartEvents();
  }

  showSuccess() {
    const modalBody = document.getElementById('shop-modal-body');
    modalBody.innerHTML = `
      <div class="shop-success-state">
        <div class="shop-success-icon">
          <i class="fa-solid fa-check"></i>
        </div>
        <h2>¡Pedido Enviado!</h2>
        <p>Tu pedido fue enviado por WhatsApp. Te contactaremos pronto.</p>
        <button class="shop-btn-primary" id="shop-continue-shopping">
          Seguir Comprando
        </button>
      </div>
    `;

    document.getElementById('shop-continue-shopping')?.addEventListener('click', () => {
      this.closeModal();
      window.location.hash = 'shop';
    });
  }

  showError(message) {
    const existing = document.querySelector('.shop-error-toast');
    if (existing) {
      existing.remove();
    }

    const toast = document.createElement('div');
    toast.className = 'shop-error-toast';
    toast.innerHTML = `
      <i class="fa-solid fa-exclamation-circle"></i>
      <span>${escapeHtml(message)}</span>
    `;

    document.getElementById('shop-modal-body').appendChild(toast);

    setTimeout(() => toast.remove(), 3000);
  }

  closeModal() {
    const modal = document.getElementById('shop-modal');
    modal.classList.remove('active');
  }

  setupCartEvents() {
    const cartItems = ShopCart.getItems();

    document.querySelectorAll('.shop-qty-btn.plus').forEach(btn => {
      btn.addEventListener('click', () => {
        const productId = btn.dataset.productId;
        const item = cartItems.find(i => i.id === productId);
        if (item) {
          if (item.stock !== undefined && item.quantity >= item.stock) {
            this.showToast('Stock máximo alcanzado', 'error');
            return;
          }
          const newQty = item.quantity + 1;
          ShopCart.updateQuantity(productId, newQty);
          this._updateCartItemUI(productId);
        }
      });
    });

    document.querySelectorAll('.shop-qty-btn.minus').forEach(btn => {
      btn.addEventListener('click', () => {
        const productId = btn.dataset.productId;
        const item = cartItems.find(i => i.id === productId);
        if (item) {
          if (item.quantity <= 1) {
            ShopCart.removeItem(productId);
            this.refreshCart();
          } else {
            const newQty = item.quantity - 1;
            ShopCart.updateQuantity(productId, newQty);
            this._updateCartItemUI(productId);
          }
        }
      });
    });

    document.querySelectorAll('.shop-remove-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const productId = btn.dataset.productId;
        ShopCart.removeItem(productId);
        this.refreshCart();
      });
    });

    document.getElementById('shop-close-modal')?.addEventListener('click', () => {
      this.closeModal();
    });

    document.getElementById('shop-go-checkout')?.addEventListener('click', () => {
      const isOpen = ShopUI.checkIfOpen(this.settings);
      if (!isOpen) {
        this.showToast('El negocio está cerrado. No se pueden realizar pedidos.', 'error');
        return;
      }
      this.showCheckout();
    });
  }

  _updateCartItemUI(productId) {
    const item = ShopCart.getItems().find(i => i.id === productId);
    if (!item) {
      this.refreshCart();
      return;
    }

    const itemEl = document.querySelector(`.shop-cart-item[data-product-id="${productId}"]`);
    if (!itemEl) {
      this.refreshCart();
      return;
    }

    const qtyEl = itemEl.querySelector('.shop-qty-value');
    if (qtyEl) {
      qtyEl.textContent = item.quantity;
    }

    const priceEl = itemEl.querySelector('.shop-cart-item-price');
    if (priceEl) {
      priceEl.textContent = '$' + (item.price * item.quantity).toLocaleString();
    }

    this._updateCartFooter();
    this._updateCartButton();
  }

  _updateCartFooter() {
    const totalEl = document.querySelector('.shop-cart-total-value');
    if (totalEl) {
      totalEl.textContent = '$' + ShopCart.getSubtotal().toLocaleString();
    }
  }

  _updateCartButton() {
    const btn = document.getElementById('shop-cart-button');
    if (!btn) {
      return;
    }

    const count = ShopCart.getItemCount();
    const subtotal = ShopCart.getSubtotal();

    let countEl = btn.querySelector('.shop-cart-count');
    if (count > 0) {
      if (!countEl) {
        countEl = document.createElement('span');
        countEl.className = 'shop-cart-count';
        const iconEl = btn.querySelector('.shop-cart-icon');
        if (iconEl) {
          iconEl.appendChild(countEl);
        }
      }
      countEl.textContent = count;
    } else if (countEl) {
      countEl.remove();
    }

    const infoEl = btn.querySelector('.shop-cart-info');
    if (infoEl) {
      infoEl.innerHTML =
        count > 0
          ? '<span class="shop-cart-total">$' + subtotal.toLocaleString() + '</span>'
          : '<span class="shop-cart-empty">Carrito vacío</span>';
    }

    btn.classList.toggle('has-items', count > 0);
  }

  refreshCart() {
    const modalBody = document.getElementById('shop-modal-body');
    modalBody.innerHTML = ShopUI.renderCartModal();
    this.setupCartEvents();

    this._updateCartButton();
  }

  setupCartButton() {
    const cartBtn = document.getElementById('shop-cart-button');
    const modal = document.getElementById('shop-modal');
    const modalBody = document.getElementById('shop-modal-body');

    cartBtn?.addEventListener('click', () => {
      if (ShopCart.isEmpty()) {
        return;
      }

      modalBody.innerHTML = ShopUI.renderCartModal();
      modal.classList.add('active', 'animate-open');
      setTimeout(() => modal.classList.remove('animate-open'), 400);
      this.setupCartEvents();
    });
  }
}

export default new ShopCheckout();
