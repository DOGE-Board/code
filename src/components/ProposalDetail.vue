<template>
  <div class="proposal-detail-container">
    <Header />
    <div class="proposal-detail-content">
      <template v-if="proposal">
        <h1>{{ proposal.name }}</h1>
        
        <div class="argument-counts">
          <div class="count-item favor">
            <i class="fas fa-thumbs-up"></i>
            <div class="count-details">
              <span class="count">{{ favorCount }}</span>
              <span class="label">Arguments in Favor</span>
            </div>
          </div>
          <div class="count-item against">
            <i class="fas fa-thumbs-down"></i>
            <div class="count-details">
              <span class="count">{{ againstCount }}</span>
              <span class="label">Arguments Against</span>
            </div>
          </div>
        </div>

        <div class="proposal-section">
          <h3>Description</h3>
          <p>{{ proposal.description }}</p>
        </div>

        <ProposalArguments 
          :proposal-id="proposal.id"
          :user="user"
          @arguments-updated="updateCounts"
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
      favorCount: 0,
      againstCount: 0
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
    },

    updateCounts({ favorCount, againstCount }) {
      this.favorCount = favorCount
      this.againstCount = againstCount
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

.argument-counts {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
}

.count-item {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.count-item i {
  font-size: 1.5rem;
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
}

.count {
  font-size: 1.5rem;
  font-weight: 600;
  color: #333;
}

.label {
  font-size: 0.9rem;
  color: #666;
}
</style> 