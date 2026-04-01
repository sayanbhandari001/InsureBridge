import { useListUsers } from "@workspace/api-client-react"
import { Card } from "@/components/ui/card"
import { Building2, Mail, Phone, Shield } from "lucide-react"

export default function Users() {
  const { data: users, isLoading } = useListUsers()

  const getRoleColor = (role: string) => {
    switch(role) {
      case 'admin': return 'bg-muted/40 text-muted-foreground'
      case 'insurer': return 'bg-purple-100 text-purple-700'
      case 'tpa': return 'bg-orange-100 text-orange-700'
      case 'hospital': return 'bg-emerald-100 text-emerald-700'
      case 'customer': return 'bg-blue-100 text-blue-700'
      default: return 'bg-muted/40 text-muted-foreground'
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-display font-bold text-foreground">Directory</h1>
        <p className="text-muted-foreground mt-1">Manage system users across all roles and organizations.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {isLoading ? (
          <div className="col-span-full py-12 text-center text-muted-foreground">Loading users...</div>
        ) : users?.map((user) => (
          <Card key={user.id} className="border-none shadow-md overflow-hidden bg-white hover:shadow-lg transition-all group">
            <div className={`h-2 w-full ${getRoleColor(user.role).split(' ')[0]}`} />
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 rounded-full bg-muted/40 flex items-center justify-center text-lg font-bold text-muted-foreground">
                  {user.name.charAt(0)}
                </div>
                <span className={`text-xs px-2.5 py-1 uppercase tracking-wider font-bold rounded-md ${getRoleColor(user.role)}`}>
                  {user.role}
                </span>
              </div>
              
              <h3 className="text-xl font-bold text-foreground mb-1">{user.name}</h3>
              
              <div className="space-y-2 mt-4">
                {user.organization && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Building2 className="w-4 h-4 text-muted-foreground/70" />
                    <span className="truncate">{user.organization}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="w-4 h-4 text-muted-foreground/70" />
                  <span className="truncate">{user.email}</span>
                </div>
                {user.phone && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="w-4 h-4 text-muted-foreground/70" />
                    <span>{user.phone}</span>
                  </div>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
