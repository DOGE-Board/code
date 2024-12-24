import { ref } from 'vue'
import { supabase } from '../supabase'

export const proposals = ref([])

export const fetchProposals = async () => {
  const { data, error } = await supabase
    .from('proposals')
    .select(`
      *,
      upVotes:proposal_votes(count).filter(vote_type.eq.up),
      downVotes:proposal_votes(count).filter(vote_type.eq.down)
    `)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching proposals:', error)
    return
  }

  proposals.value = data.map(proposal => ({
    ...proposal,
    upVotes: proposal.upVotes[0]?.count || 0,
    downVotes: proposal.downVotes[0]?.count || 0
  }))
}

export const addProposal = async (proposal) => {
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    console.error('User must be authenticated to add proposals')
    return
  }

  const { data, error } = await supabase
    .from('proposals')
    .insert({
      ...proposal,
      user_id: user.id
    })
    .select()
    .single()

  if (error) {
    console.error('Error adding proposal:', error)
    return
  }

  proposals.value.push(data)
}