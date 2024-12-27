<template>
  <div class="terms-container">
    <Header />
    <div class="terms-content">
      <h1>Terms of Service</h1>
      <div class="terms-section">
        <h2>1. Acceptance of Terms</h2>
        <p>By accessing and using this platform, you accept and agree to be bound by the terms and conditions of this agreement.</p>
      </div>

      <div class="terms-section">
        <h2>2. User Responsibilities</h2>
        <p>You agree to:</p>
        <ul>
          <li>Provide accurate information</li>
          <li>Maintain the security of your account</li>
          <li>Not misuse the platform</li>
          <li>Respect other users' rights</li>
        </ul>
      </div>

      <div class="terms-section">
        <h2>3. Content Guidelines</h2>
        <p>When creating proposals or voting, you must:</p>
        <ul>
          <li>Not post misleading information</li>
          <li>Not violate any laws or regulations</li>
          <li>Not infringe on others' rights</li>
          <li>Maintain professional conduct</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
import Header from './Header.vue'
</script>

<style scoped>
.terms-container {
  min-height: 100vh;
  background-color: #f5f7fa;
}

.terms-content {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

h1 {
  color: #333;
  margin-bottom: 2rem;
}

.terms-section {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  margin-bottom: 1.5rem;
}

h2 {
  color: #666;
  margin-bottom: 1rem;
}

ul {
  padding-left: 1.5rem;
}

li {
  margin-bottom: 0.5rem;
}

.terms a {
  color: #409eff;
  text-decoration: none;
}

.terms a:hover {
  text-decoration: underline;
}
</style> 