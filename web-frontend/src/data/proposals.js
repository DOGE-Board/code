import { ref } from 'vue'
import { supabase } from '../supabase'

export const proposals = ref([])

export const fetchProposals = async () => {
  const { data, error } = await supabase
    .from('proposals')
    .select('*')
    .order('id', { ascending: true })

  if (error) {
    console.error('Error fetching proposals:', error)
    return
  }

  proposals.value = data
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