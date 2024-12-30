<template>
  <div class="proposal-detail-container">
    <Header />
    <div class="proposal-detail-content">
      <template v-if="proposal">
        <h1>{{ proposal.name }}</h1>
        
        <div class="proposal-stats">
          <el-button 
            :type="getUserVote(proposal.id) === 'up' ? 'success' : 'default'"
            size="large" 
            @click="handleVote(proposal.id, 'up')"
            :disabled="!user"
          >
            <i class="fas fa-arrow-up"></i>
            <span>{{ proposal.upVotes }} Up Votes</span>
          </el-button>
          <el-button 
            :type="getUserVote(proposal.id) === 'down' ? 'danger' : 'default'"
            size="large" 
            @click="handleVote(proposal.id, 'down')"
            :disabled="!user"
          >
            <i class="fas fa-arrow-down"></i>
            <span>{{ proposal.downVotes }} Down Votes</span>
          </el-button>
        </div>

        <div class="proposal-section">
          <h3>Description</h3>
          <p>{{ proposal.description }}</p>
        </div>

        <ProposalArguments 
          :proposal-id="proposal.id"
          :user="user"
        />
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

export default defineComponent({
  name: 'ProposalDetail',
  components: {
    Header,
    ProposalArguments
  },
  data() {
    return {
      user: null,
      userVotes: {}
    }
  },
  computed: {
    proposal() {
      return proposals.value.find(p => p.id === parseInt(this.$route.params.id))
    }
  },
  async mounted() {
    const { data: { user: currentUser } } = await supabase.auth.getUser()
    this.user = currentUser
    
    if (currentUser) {
      await this.fetchUserVotes()
    }
    
    await Promise.all([
      fetchProposals()
    ])
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

h1 {
  margin-bottom: 1.5rem;
  color: #333;
}

h2 {
  color: #666;
  margin-bottom: 1rem;
}

.proposal-stats {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
}

.proposal-stats .el-button {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 1rem;
}

.proposal-stats i {
  font-size: 1.2rem;
}

.proposal-section {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  margin-bottom: 1.5rem;
}

.argument-list {
  margin: 0;
  padding-left: 20px;
}

.argument-list li {
  margin-bottom: 0.5rem;
}

.not-found {
  text-align: center;
  font-size: 1.2rem;
  color: #666;
  margin-top: 2rem;
}

.comments-list {
  margin-bottom: 1.5rem;
}

.comment {
  border-bottom: 1px solid #eee;
  padding: 1rem 0;
}

.comment:last-child {
  border-bottom: none;
}

.comment-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
  color: #666;
}

.comment-content {
  margin: 0;
  white-space: pre-wrap;
}

.comment-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.login-prompt {
  text-align: center;
  color: #666;
  padding: 1rem;
  background: #f9f9f9;
  border-radius: 4px;
}

.comment-author {
  font-weight: 500;
  color: #409EFF;
}
</style> 