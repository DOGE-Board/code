<template>
  <div class="dashboard-container">
    <Header />
    <div class="dashboard-content">
      <h1>Active Proposals</h1>
      
      <el-table 
        :data="proposals" 
        style="width: 100%" 
        border
        @row-click="handleRowClick"
        v-loading="loading"
      >
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="Proposal Name" />
        <el-table-column label="Votes" width="200">
          <template #default="{ row }">
            <div class="vote-cell">
              <div class="vote-count">
                <i class="fas fa-arrow-up vote-icon up"></i>
                {{ row.upVotes || 0 }}
              </div>
              <div class="vote-count">
                <i class="fas fa-arrow-down vote-icon down"></i>
                {{ row.downVotes || 0 }}
              </div>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import Header from './Header.vue'
import { proposals, fetchProposals } from '../data/proposals'
import { supabase } from '../supabase'

const router = useRouter()
const loading = ref(true)

onMounted(async () => {
  await fetchProposals()
  loading.value = false
})

const handleRowClick = (row) => {
  router.push(`/proposal/${row.id}`)
}
</script>

<style scoped>
.dashboard-container {
  min-height: 100vh;
  background-color: #f5f7fa;
}

.dashboard-content {
  padding: 2rem;
}

h1 {
  margin-bottom: 2rem;
  color: #333;
}

.vote-cell {
  display: flex;
  align-items: center;
  gap: 20px;
}

.vote-count {
  display: flex;
  align-items: center;
  gap: 8px;
}

.vote-icon {
  font-size: 1rem;
}

.vote-icon.up {
  color: #67c23a;
}

.vote-icon.down {
  color: #f56c6c;
}

:deep(.el-table) {
  margin-top: 1rem;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

:deep(.el-table__header) {
  font-weight: 600;
  background-color: #f5f7fa;
}

:deep(.el-table__row) {
  transition: all 0.3s ease;
}

:deep(.el-table__row:hover) {
  background-color: #f5f7fa;
}
</style>
