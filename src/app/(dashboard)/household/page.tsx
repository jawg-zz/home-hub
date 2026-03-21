import { prisma } from '@/lib/prisma'
import ShoppingList from './ShoppingList'
import ChoresList from './ChoresList'
import Calendar from './Calendar'

export default async function HouseholdPage() {
  const [shoppingItems, chores, events] = await Promise.all([
    prisma.shoppingItem.findMany({ orderBy: { createdAt: 'desc' } }),
    prisma.chore.findMany({ orderBy: { createdAt: 'desc' } }),
    prisma.calendarEvent.findMany({ 
      where: {
        date: { gte: new Date(new Date().setDate(new Date().getDate() - 7)) }
      },
      orderBy: { date: 'asc' }
    }),
  ])

  return (
    <div>
      <header style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Household</h1>
        <p style={{ color: '#666' }}>Manage your home tasks, lists, and schedule</p>
      </header>

      <div className="grid grid-2">
        {/* Shopping List */}
        <div className="card">
          <h2 style={{ marginBottom: '1rem', fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            🛒 Shopping List
            <span className="badge badge-success">{shoppingItems.filter(i => !i.checked).length}</span>
          </h2>
          <ShoppingList items={shoppingItems} />
        </div>

        {/* Chores */}
        <div className="card">
          <h2 style={{ marginBottom: '1rem', fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            🧹 Chores
            <span className="badge badge-warning">{chores.filter(c => !c.completed).length}</span>
          </h2>
          <ChoresList chores={chores} />
        </div>
      </div>

      {/* Calendar */}
      <div className="card" style={{ marginTop: '1.5rem' }}>
        <h2 style={{ marginBottom: '1rem', fontSize: '1.25rem' }}>📅 Calendar</h2>
        <Calendar events={events} />
      </div>
    </div>
  )
}
