<template>
  <div class="proposal-detail-container">
    <Header />
    <div class="proposal-detail-content">
      <template v-if="proposal">
        <h1>{{ proposal.name }}</h1>
        
        <div class="proposal-stats">
          <div class="vote-stat">
            <i class="fas fa-arrow-up vote-icon up"></i>
            <span>{{ proposal.upVotes }} Up Votes</span>
          </div>
          <div class="vote-stat">
            <i class="fas fa-arrow-down vote-icon down"></i>
            <span>{{ proposal.downVotes }} Down Votes</span>
          </div>
        </div>

        <div class="proposal-section">
          <h2>Description</h2>
          <p>{{ proposal.description }}</p>
        </div>

        <div class="proposal-section">
          <h2>Arguments in Favor</h2>
          <ul class="argument-list">
            <li v-for="(arg, index) in proposal.favorArguments" :key="index">
              {{ arg }}
            </li>
          </ul>
        </div>

        <div class="proposal-section">
          <h2>Arguments Against</h2>
          <ul class="argument-list">
            <li v-for="(arg, index) in proposal.againstArguments" :key="index">
              {{ arg }}
            </li>
          </ul>
        </div>
      </template>
      <div v-else class="not-found">
        Proposal not found
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import Header from './Header.vue'
import { proposals } from '../data/proposals'

const route = useRoute()
const proposal = computed(() => 
  proposals.value.find(p => p.id === parseInt(route.params.id))
)
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
  gap: 2rem;
  margin-bottom: 2rem;
}

.vote-stat {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 1.1rem;
}

.vote-icon {
  font-size: 1.2rem;
}

.vote-icon.up {
  color: #67c23a;
}

.vote-icon.down {
  color: #f56c6c;
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