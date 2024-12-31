<template>
  <div class="proposal-detail-container">
    <Header />
    <div class="proposal-detail-content">
      <template v-if="proposal">


        <div class="argument-counts">
          <div class="count-box">
            <div class="count-item favor">
              <i class="fas fa-thumbs-up"></i>
              <div class="count-details">
                <span class="count">{{ favorCount }}</span>
                <span class="label">In Favor</span>
              </div>
            </div>
            <div class="divider"></div>
            <div class="count-item against">
              <i class="fas fa-thumbs-down"></i>
              <div class="count-details">
                <span class="count">{{ againstCount }}</span>
                <span class="label">Against</span>
              </div>
            </div>
          </div>
        </div>
        
        <div class="proposal-content-box">
          <div class="proposal-header">
            <div class="title-section">
              <p><b>{{ proposal.name }}</b></p>
              <div class="description" v-html="sanitizedDescription"></div>
            </div>
           
             <el-link v-if="user && user.id === proposal.user_id" 
              type="primary" 
              @click="showEditModal = true"  ><i class="fas fa-edit"></i>
            </el-link>
              
            
          </div>
        </div>

        <ProposalArguments 
          :proposal-id="proposal.id"
          :user="user"
          @arguments-updated="updateCounts"
        />

        <!-- Add Edit Modal -->
        <el-dialog
          v-model="showEditModal"
          title="Edit Proposal"
          width="50%"
        >
          <el-form :model="editForm" label-position="top">
            <el-form-item label="Proposal Name" required>
              <el-input v-model="editForm.name" />
            </el-form-item>
            
            <el-form-item label="Description" required>
              <RichTextEditor
                v-model="editForm.description"
                placeholder="Enter proposal description..."
              />
            </el-form-item>
          </el-form>
          
          <template #footer>
            <span class="dialog-footer">
              <el-button @click="showEditModal = false">Cancel</el-button>
              <el-button type="primary" @click="handleEditProposal">
                Update Proposal
              </el-button>
            </span>
          </template>
        </el-dialog>
      </template>
      <div v-else class="not-found">
        Proposal not found
      </div>
    </div>
  </div>
</template>

<script>
import { defineComponent } from 'vue'
import Header from './Header.vue'
import ProposalArguments from './ProposalArguments.vue'
import { proposals, fetchProposals } from '../data/proposals'
import { supabase } from '../supabase'
import { ElMessage } from 'element-plus'
import RichTextEditor from './RichTextEditor.vue'
import DOMPurify from 'dompurify'

export default defineComponent({
  name: 'ProposalDetail',
  components: {
    Header,
    ProposalArguments,
    RichTextEditor
  },
  data() {
    return {
      user: null,
      favorCount: 0,
      againstCount: 0,
      showEditModal: false,
      editForm: {
        name: '',
        description: ''
      }
    }
  },
  computed: {
    proposal() {
      return proposals.value.find(p => p.id === parseInt(this.$route.params.id))
    },
    sanitizedDescription() {
      return this.proposal ? DOMPurify.sanitize(this.proposal.description) : ''
    }
  },
  async mounted() {
    const { data: { user: currentUser } } = await supabase.auth.getUser()
    this.user = currentUser
    
    await fetchProposals()
    
    if (this.proposal) {
      this.initEditForm()
    }
  },
  methods: {
    async fetchUserVotes() {
      const { data: votes } = await supabase
        .from('proposal_votes')
        .select('proposal_id, vote_type')
        .eq('user_id', this.user.id)

      if (votes) {
        votes.forEach(vote => {
          this.userVotes[vote.proposal_id] = vote.vote_type
        })
      }
    },

    getUserVote(proposalId) {
      return this.userVotes[proposalId]
    },

    async handleVote(proposalId, voteType) {
      if (!this.user) return
      
      const currentVote = this.getUserVote(proposalId)
      
      try {
        if (currentVote === voteType) {
          await supabase
            .from('proposal_votes')
            .delete()
            .eq('proposal_id', proposalId)
            .eq('user_id', this.user.id)
          
          delete this.userVotes[proposalId]
        } else {
          await supabase
            .from('proposal_votes')
            .upsert({
              proposal_id: proposalId,
              user_id: this.user.id,
              vote_type: voteType
            })
          
          this.userVotes[proposalId] = voteType
        }
        
        await fetchProposals()
      } catch (error) {
        ElMessage.error('Error while voting')
      }
    },

    updateCounts({ favorCount, againstCount }) {
      this.favorCount = favorCount
      this.againstCount = againstCount
    },

    initEditForm() {
      this.editForm.name = this.proposal.name
      this.editForm.description = this.proposal.description
    },

    async handleEditProposal() {
      if (!this.editForm.name.trim() || !this.editForm.description.trim()) {
        ElMessage.error('Name and description are required')
        return
      }

      try {
        const { error } = await supabase
          .from('proposals')
          .update({ 
            name: this.editForm.name.trim(),
            description: this.editForm.description.trim()
          })
          .eq('id', this.proposal.id)
          .eq('user_id', this.user.id)

        if (error) throw error

        await fetchProposals()
        this.showEditModal = false
        ElMessage.success('Proposal updated successfully')
      } catch (error) {
        ElMessage.error('Error updating proposal')
        console.error(error)
      }
    }
  }
})
</script>

<style scoped>
.proposal-detail-container {
  min-height: 100vh;
  background-color: #f5f7fa;
}

.proposal-detail-content {
  padding: 2rem;
  max-width: 800px;
  margin: 0 auto;
}

.proposal-content-box {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  margin-bottom: 1.5rem;
}

.proposal-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 1.5rem;
}

.title-section {
  flex: 1;
  margin-right: 1.5rem;
}

.title-section h3 {
  margin: 0 0 0.8rem 0;
  color: #303133;
  font-size: 1.4rem;
}

.description {
  margin: 0;
  color: #606266;
  line-height: 1.6;

  :deep(p) {
    margin: 0 0 1em;
    &:last-child {
      margin-bottom: 0;
    }
  }

  :deep(ul, ol) {
    padding-left: 2em;
    margin: 0.5em 0;
  }

  :deep(li) {
    margin-bottom: 0.3em;
  }
}

.proposal-header .el-button {
  flex-shrink: 0;
}

.argument-counts {
  margin-bottom: 1.5rem;
}

.count-box {
  display: flex;
  align-items: center;
  background: white;
  padding: 0.8rem 1.2rem;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  max-width: fit-content;
}

.count-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.divider {
  width: 1px;
  height: 24px;
  background-color: #dcdfe6;
  margin: 0 1rem;
}

.count-item i {
  font-size: 1.1rem;
}

.count-item.favor i {
  color: #67C23A;
}

.count-item.against i {
  color: #F56C6C;
}

.count-details {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
}

.count {
  font-size: 1.1rem;
  font-weight: 600;
  color: #303133;
  line-height: 1;
}

.label {
  font-size: 0.75rem;
  color: #606266;
}

.proposal-section {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  margin-bottom: 1.5rem;
}

.proposal-section h3 {
  color: #303133;
  margin-top: 0;
  margin-bottom: 1rem;
  font-size: 1.2rem;
}

.proposal-section p {
  color: #606266;
  line-height: 1.6;
  margin: 0;
  white-space: pre-wrap;
}

.not-found {
  text-align: center;
  font-size: 1.2rem;
  color: #909399;
  margin-top: 4rem;
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

/* Edit button styling */
.proposal-header .el-button {
  padding: 0.8rem 1.2rem;
}

.proposal-header .el-button i {
  margin-right: 0.5rem;
}

/* Modal styling */
:deep(.el-dialog) {
  border-radius: 8px;
}

:deep(.el-dialog__header) {
  padding: 1.5rem;
  margin-right: 0;
  border-bottom: 1px solid #dcdfe6;
}

:deep(.el-dialog__body) {
  padding: 1.5rem;
}

:deep(.el-dialog__footer) {
  padding: 1rem 1.5rem;
  border-top: 1px solid #dcdfe6;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.8rem;
}

/* Responsive design */
@media (max-width: 768px) {
  .proposal-detail-content {
    padding: 1rem;
  }

  .argument-counts {
    flex-direction: column;
  }

  .proposal-header {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }

  .proposal-header h1 {
    font-size: 1.5rem;
  }
}

:deep(.rich-text-editor) {
  margin-bottom: 1rem;
}
</style> 