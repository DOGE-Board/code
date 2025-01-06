<template>
  <div class="login-container">
    <div class="login-card">
      <h1 class="title">Welcome Back</h1>
      <p class="subtitle">Sign in to continue to your account</p>

      <div class="oauth-grid">
        <!-- <el-button class="oauth-button google" @click="handleOAuthLogin('google')">
          <i class="fab fa-google"></i>
          Google
        </el-button> -->

        <el-button class="oauth-button github" @click="handleOAuthLogin('github')">
          <i class="fab fa-github"></i>
          GitHub
        </el-button>

        <!-- <el-button class="oauth-button facebook" @click="handleOAuthLogin('facebook')">
          <i class="fab fa-facebook-f"></i>
          Facebook
        </el-button> -->

        <el-button class="oauth-button twitter" @click="handleOAuthLogin('twitter')">
          <i class="fab fa-twitter"></i>
          X (Twitter)
        </el-button>
      </div>

      <p class="terms">
          By continuing, you agree to DOGE-Board's
          <router-link to="/terms-of-service">Terms of Service</router-link> and 
          <router-link to="/privacy-policy">Privacy Policy</router-link>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '../supabase'

const router = useRouter()
const loading = ref(false)
const error = ref(null)

const handleOAuthLogin = async (provider) => {
  try {
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: provider,
            options: {
                redirectTo: `${window.location.origin}/callback`,
            },
        });
        
        if (error) {
          ElMessage.error('Login failed: ' + error.message);
        } else {
          ElMessage.success('Redirecting to login provider...');
        }
      } catch (err) {
        ElMessage.error('An unexpected error occurred');
        console.error(err);
      }
}
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #ffffff;
  padding: 20px;
}

.login-card {
  width: 100%;
  max-width: 500px;
  text-align: center;
  padding: 40px 20px;
}

.title {
  font-size: 2.5rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 10px;
}

.subtitle {
  color: #666;
  margin-bottom: 40px;
  font-size: 1.1rem;
}

.oauth-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 40px;
  padding: 0 20px;
}

.oauth-button {
  height: 44px;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  border: 1px solid #e0e0e0;
  background: white;
  color: #333;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.oauth-button:hover {
  background: #f5f5f5;
  border-color: #d0d0d0;
}

.oauth-button i {
  font-size: 1.2rem;
}

.google i {
  color: #4285f4;
}

.github {
  background: #24292e;
  color: white;
  border: none;
}

.github:hover {
  background: #2f363d;
}

.facebook {
  background: #1877f2;
  color: white;
  border: none;
}

.facebook:hover {
  background: #166fe5;
}

.twitter {
  background: #1da1f2;
  color: white;
  border: none;
}

.twitter:hover {
  background: #1a91da;
}

.terms {
  color: #666;
  font-size: 0.9rem;
  max-width: 400px;
  margin: 0 auto;
  line-height: 1.5;
}
.terms a {
  color: #409eff;
  text-decoration: none;
}

.terms a:hover {
  text-decoration: underline;
}
</style>