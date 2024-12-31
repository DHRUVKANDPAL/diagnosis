import { api } from '@/trpc/react'
import React from 'react'
import {useLocalStorage} from 'usehooks-ts'
const useProject = () => {
  const {data:projects} =api.project.getProject.useQuery();
  const [projectId,setProjectId]=useLocalStorage('diagnosis-project-id','');
  const project=projects?.find((project)=>project.id===projectId);
  return {projects,project,projectId,setProjectId}
}

export default useProject