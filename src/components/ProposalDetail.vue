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
          <h2>Description</h2>
          <p>{{ proposal.description }}</p>
        </div>

        <div class="proposal-section">
          <h2>Arguments in Favor</h2>
          <p>{{ proposal.favorArguments }}</p>
          
        </div>

        <div class="proposal-section">
          <h2>Arguments Against</h2>
          <p>{{ proposal.againstArguments }}</p>
          
        </div>
      </template>
      <div v-else class="not-found">
        Proposal not found
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import Header from './Header.vue'
import { proposals, fetchProposals } from '../data/proposals'
import { supabase } from '../supabase'
import { ElMessage } from 'element-plus'

const route = useRoute()
const user = ref(null)
const userVotes = ref({})

const proposal = computed(() => 
  proposals.value.find(p => p.id === parseInt(route.params.id))
)

onMounted(async () => {
  const { data: { user: currentUser } } = await supabase.auth.getUser()
  user.value = currentUser
  
  if (currentUser) {
    await fetchUserVotes()
  }
  
  await fetchProposals()
})

const fetchUserVotes = async () => {
  const { data: votes } = await supabase
    .from('proposal_votes')
    .select('proposal_id, vote_type')
    .eq('user_id', user.value.id)

  if (votes) {
    votes.forEach(vote => {
      userVotes.value[vote.proposal_id] = vote.vote_type
    })
  }
}

const getUserVote = (proposalId) => {
  return userVotes.value[proposalId]
}

const handleVote = async (proposalId, voteType) => {
  if (!user.value) return
  
  const currentVote = getUserVote(proposalId)
  
  try {
    if (currentVote === voteType) {
      // Remove vote
      await supabase
        .from('proposal_votes')
        .delete()
        .eq('proposal_id', proposalId)
        .eq('user_id', user.value.id)
      
      delete userVotes.value[proposalId]
    } else {
      // Upsert vote
      await supabase
        .from('proposal_votes')
        .upsert({
          proposal_id: proposalId,
          user_id: user.value.id,
          vote_type: voteType
        })
      
      userVotes.value[proposalId] = voteType
    }
    
    await fetchProposals()
  } catch (error) {
    ElMessage.error('Error while voting')
  }
}
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
</style> 