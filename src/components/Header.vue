<template>
  <header class="header">
    <div class="logo">
      <router-link to="/">DOGE-Board</router-link>
    </div>
    
    <div class="nav-actions">
     
      <template v-if="user">
       
        <el-dropdown>
          <span class="user-menu">
            {{ user.user_metadata?.user_name || user.user_metadata?.full_name || user.user_metadata?.name }}
            <!-- {{ user.email }} -->
            <i class="fas fa-chevron-down"></i>
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item @click="handleLogout">
                <i class="fas fa-sign-out-alt"></i> Logout
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </template>
      <template v-else>
        <el-button type="primary" @click="navigateToLogin">
          Login
        </el-button>
      </template>
    </div>
  </header>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '../supabase'

const router = useRouter()
const user = ref(null)

onMounted(async () => {
  const { data: { user: currentUser } } = await supabase.auth.getUser()
  user.value = currentUser

  supabase.auth.onAuthStateChange((event, session) => {
    user.value = session?.user || null
  })
})

const handleLogout = async () => {
  await supabase.auth.signOut()
  router.push('/login')
}

const navigateToLogin = () => {
  router.push('/login')
}
</script>

<style scoped>
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background-color: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.logo a {
  font-size: 1.5rem;
  font-weight: 600;
  color: #333;
  text-decoration: none;
}

.user-menu {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.nav-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}
</style> 