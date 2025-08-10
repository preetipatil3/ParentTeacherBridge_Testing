"use client"

import React, { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { validatePasswordRules } from "../auth"
import { useTeacherLogin } from "../hooks/useTeacherLogin"

interface TeacherLoginProps {
  onLoggedIn?: (user: { email: string; teacherId: number }) => void;
  onLogin?: (userData: any) => void;
  onBack?: () => void;
}

export default function TeacherLogin({ onLoggedIn, onLogin, onBack }: TeacherLoginProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const { isLoading, error, login } = useTeacherLogin()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) {
      toast("Error", "Please fill in all fields", { variant: "destructive" })
      return
    }
    const ruleError = validatePasswordRules(password)
    if (ruleError) {
      toast("Error", ruleError, { variant: "destructive" })
      return
    }
    const res = await login(email, password)
    if (res.success) {
      toast("Success", "Login successful!", {})
      const userData = { email, teacherId: 0, role: 'teacher' };
      // Use the new onLogin prop if available, otherwise fall back to onLoggedIn
      if (onLogin) {
        onLogin(userData);
      } else if (onLoggedIn) {
        onLoggedIn({ email, teacherId: 0 });
      }
    } else {
      toast("Error", res.error || error || "Login failed", { variant: "destructive" })
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          {onBack && (
            <Button
              type="button"
              variant="ghost"
              onClick={onBack}
              className="self-start mb-2"
            >
              ← Back to Role Selection
            </Button>
          )}
          <CardTitle className="text-2xl font-bold text-center">Teacher Login</CardTitle>
          <CardDescription className="text-center">Enter your email and password to sign in.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="teacher@school.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
              <p className="text-xs text-gray-500">Password must be at least 8 characters and include uppercase, lowercase, digit, and special character.</p>
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>{isLoading ? "Signing in..." : "Sign In"}</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
