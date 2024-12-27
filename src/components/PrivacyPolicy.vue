<template>
  <div class="policy-container">
    <Header />
    <div class="policy-content">
      <h1>Privacy Policy</h1>
      <div class="policy-section">
        <h2>1. Information We Collect</h2>
        <p>We collect information that you provide directly to us when you:</p>
        <ul>
          <li>Create an account</li>
          <li>Submit proposals</li>
          <li>Vote on proposals</li>
          <li>Interact with other users</li>
        </ul>
      </div>

      <div class="policy-section">
        <h2>2. How We Use Your Information</h2>
        <p>We use the information we collect to:</p>
        <ul>
          <li>Provide and maintain our services</li>
          <li>Process your votes and proposals</li>
          <li>Send you important updates</li>
          <li>Improve our platform</li>
        </ul>
      </div>

      <div class="policy-section">
        <h2>3. Information Sharing</h2>
        <p>We do not sell or share your personal information with third parties except as described in this policy.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import Header from './Header.vue'
</script>

<style scoped>
.policy-container {
  min-height: 100vh;
  background-color: #f5f7fa;
}

.policy-content {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

h1 {
  color: #333;
  margin-bottom: 2rem;
}

.policy-section {
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
</style> 