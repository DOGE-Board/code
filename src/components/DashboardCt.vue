<template>
  <div class="proposal-container">
    <Header />
    <div class="proposal-content">
      <div class="header-actions">
       
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
        <el-table-column prop="name" label="Proposal Name" width="180">
          <template #default="{ row }">
            <router-link 
              :to="`/proposal/${row.id}`" 
              class="proposal-link"
            >
              {{ row.name }}
            </router-link>
          </template>
        </el-table-column>
        <el-table-column prop="description" label="Proposal Description">
          <template #default="{ row }">
            {{ stripHtmlAndTrim(row.description) }}
          </template>
        </el-table-column>
        <el-table-column label="Arguments" width="200">
          <template #default="{ row }">
            <div class="argument-counts">
              <div class="count-item">
                <i class="fas fa-thumbs-up"></i>
                <span>{{ row.favorCount || 0 }}</span>
              </div>
              <div class="count-item">
                <i class="fas fa-thumbs-down"></i>
                <span>{{ row.againstCount || 0 }}</span>
              </div>
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
              <RichTextEditor
                v-model="newProposal.description"
                placeholder="Enter proposal description..."
              />
            </el-form-item>

          <el-form-item label="Initial Argument">
            <el-select 
              v-model="newProposal.argumentType" 
              placeholder="Select argument type"
              style="width: 100%; margin-bottom: 1rem;"
            >
              <el-option label="In Favor" value="favor" />
              <el-option label="Against" value="against" />
            </el-select>
            <el-input
              v-model="newProposal.argument"
              type="textarea"
              :rows="4"
              placeholder="Enter your initial argument"
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
import RichTextEditor from './RichTextEditor.vue'
import { supabase } from '../supabase'

const showAddModal = ref(false)
const loading = ref(true)

const newProposal = ref({
  name: '',
  description: '',
  argument: '',
  argumentType: 'favor',
})

const user = ref(null)

onMounted(async () => {
  const { data: { user: currentUser } } = await supabase.auth.getUser()
  user.value = currentUser
  
  await fetchProposals()
  loading.value = false
})

const handleAddProposal = async () => {
  if (!newProposal.value.name.trim() || !newProposal.value.description.trim()) {
    ElMessage.error('Name and description are required')
    return
  }

  try {
    // First create the proposal
    const { data: proposalData, error: proposalError } = await supabase
      .from('proposals')
      .insert({
        name: newProposal.value.name.trim(),
        description: newProposal.value.description.trim(),
        user_id: user.value.id,
      })
      .select()

    if (proposalError) throw proposalError

    // If there's an argument, add it
    if (newProposal.value.argument.trim()) {
      const { error: argumentError } = await supabase
        .from('proposal_arguments')
        .insert({
          proposal_id: proposalData[0].id,
          user_id: user.value.id,
          argument_type: newProposal.value.argumentType,
          content: newProposal.value.argument.trim()
        })

      if (argumentError) throw argumentError
    }

    await fetchProposals()
    ElMessage.success('Proposal created successfully')

    // Reset form and close modal
    newProposal.value = {
      name: '',
      description: '',
      argument: '',
      argumentType: 'favor',
    }
    showAddModal.value = false
  } catch (error) {
    ElMessage.error('Error creating proposal')
    console.error(error)
  }
}

const stripHtmlAndTrim = (html) => {
  // Remove HTML tags
  const text = html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, '')
  // Trim to 250 characters and add ellipsis if needed
  return text.length > 250 ? text.slice(0, 250) + '...' : text
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

.vote-actions {
  display: flex;
  gap: 8px;
}

.proposal-link {
  color: #409EFF;
  text-decoration: none;
}

.proposal-link:hover {
  text-decoration: underline;
  cursor: pointer;
}

.argument-counts {
  display: flex;
  gap: 1.5rem;
  align-items: center;
}

.count-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.count-item i {
  font-size: 1rem;
}

.count-item:first-child i {
  color: #67C23A;
}

.count-item:last-child i {
  color: #F56C6C;
}
</style>
