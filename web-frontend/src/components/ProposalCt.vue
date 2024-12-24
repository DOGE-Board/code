<template>
  <div class="proposal-container">
    <Header />
    <div class="proposal-content">
      <div class="header-actions">
        <h1>Proposals</h1>
        <el-button type="primary" @click="showAddModal = true">
          <i class="fas fa-plus"></i> Add Proposal
        </el-button>
      </div>
      
      <el-table 
        v-loading="loading"
        :data="proposals" 
        style="width: 100%" 
        border
      >
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="Proposal Name" width="180" />
        <el-table-column prop="description" label="Proposal Description" />
        <el-table-column prop="favorArguments" label="Arguments in Favor">
          <template #default="{ row }">
            <div class="argument-text">
              {{ row.favorArguments }}
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="againstArguments" label="Arguments Against">
          <template #default="{ row }">
            <div class="argument-text">
              {{ row.againstArguments }}
            </div>
          </template>
        </el-table-column>
      </el-table>

      <!-- Add Proposal Modal -->
      <el-dialog
        v-model="showAddModal"
        title="Add New Proposal"
        width="50%"
      >
        <el-form :model="newProposal" label-position="top">
          <el-form-item label="Proposal Name" required>
            <el-input v-model="newProposal.name" />
          </el-form-item>
          
          <el-form-item label="Description" required>
            <el-input
              v-model="newProposal.description"
              type="textarea"
              :rows="3"
            />
          </el-form-item>

          <el-form-item label="Arguments in Favor">
            <el-input
              v-model="newProposal.favorArguments"
              type="textarea"
              :rows="4"
              placeholder="Enter your arguments in favor"
            />
          </el-form-item>

          <el-form-item label="Arguments Against">
            <el-input
              v-model="newProposal.againstArguments"
              type="textarea"
              :rows="4"
              placeholder="Enter your arguments against"
            />
          </el-form-item>
        </el-form>
        
        <template #footer>
          <span class="dialog-footer">
            <el-button @click="showAddModal = false">Cancel</el-button>
            <el-button type="primary" @click="handleAddProposal">
              Create Proposal
            </el-button>
          </span>
        </template>
      </el-dialog>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import Header from './Header.vue'
import { proposals, fetchProposals, addProposal } from '../data/proposals'
import { ElMessage } from 'element-plus'

const showAddModal = ref(false)
const loading = ref(true)

const newProposal = ref({
  name: '',
  description: '',
  favorArguments: '',
  againstArguments: '',
  upVotes: 0,
  downVotes: 0
})

onMounted(async () => {
  await fetchProposals()
  loading.value = false
})

const handleAddProposal = async () => {
  if (!newProposal.value.name.trim() || !newProposal.value.description.trim()) {
    ElMessage.error('Name and description are required')
    return
  }

  const cleanProposal = {
    name: newProposal.value.name.trim(),
    description: newProposal.value.description.trim(),
    favorArguments: newProposal.value.favorArguments.trim(),
    againstArguments: newProposal.value.againstArguments.trim(),
    upVotes: 0,
    downVotes: 0
  }

  await addProposal(cleanProposal)

  // Reset form and close modal
  newProposal.value = {
    name: '',
    description: '',
    favorArguments: '',
    againstArguments: '',
    upVotes: 0,
    downVotes: 0
  }
  showAddModal.value = false
}
</script>

<style scoped>
.proposal-container {
  min-height: 100vh;
  background-color: #f5f7fa;
}

.proposal-content {
  padding: 2rem;
}

.header-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.argument-list {
  margin: 0;
  padding-left: 20px;
}

.argument-list li {
  margin-bottom: 4px;
}

.argument-input {
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
}

h1 {
  margin: 0;
  color: #333;
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

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.argument-text {
  white-space: pre-wrap;
  max-height: 200px;
  overflow-y: auto;
}
</style>
