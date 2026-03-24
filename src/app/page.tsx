import { redirect } from 'next/navigation'

export default function Home() {
  // Middleware handles role-based routing. 
  // This page is a fallback that redirects to login.
  redirect('/login')
}
