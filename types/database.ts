export type RideStatus = 'pending' | 'accepted' | 'in_progress' | 'finished' | 'cancelled'
export type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'collected' | 'delivering' | 'delivered' | 'cancelled'
export type UserRole = 'passenger' | 'driver' | 'motoboy'

export interface Profile {
  id: string
  name: string
  phone: string
  role: UserRole
  vehicle_type?: string  // 'carro' | 'moto'
  is_online?: boolean
  created_at: string
}

export interface Ride {
  id: string
  passenger_id: string
  driver_id: string | null
  origin: string
  destination: string
  vehicle_type: 'carro' | 'moto'
  price: number
  platform_fee: number
  status: RideStatus
  created_at: string
  passenger?: Profile
  driver?: Profile
}

export interface Restaurant {
  id: string
  name: string
  category: string
  address: string
  is_open: boolean
  created_at: string
}

export interface MenuItem {
  id: string
  restaurant_id: string
  name: string
  description: string
  price: number
  available: boolean
}

export interface Order {
  id: string
  customer_id: string
  motoboy_id: string | null
  restaurant_id: string
  items: OrderItem[]
  total: number
  delivery_fee: number
  platform_fee: number
  address: string
  status: OrderStatus
  created_at: string
  customer?: Profile
  motoboy?: Profile
  restaurant?: Restaurant
}

export interface OrderItem {
  menu_item_id: string
  name: string
  quantity: number
  unit_price: number
}

// Supabase Database type para tipagem do cliente
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile
        Insert: Omit<Profile, 'created_at'>
        Update: Partial<Omit<Profile, 'id' | 'created_at'>>
      }
      rides: {
        Row: Ride
        Insert: Omit<Ride, 'id' | 'created_at'>
        Update: Partial<Omit<Ride, 'id' | 'created_at'>>
      }
      restaurants: {
        Row: Restaurant
        Insert: Omit<Restaurant, 'id' | 'created_at'>
        Update: Partial<Omit<Restaurant, 'id' | 'created_at'>>
      }
      menu_items: {
        Row: MenuItem
        Insert: Omit<MenuItem, 'id'>
        Update: Partial<Omit<MenuItem, 'id'>>
      }
      orders: {
        Row: Order
        Insert: Omit<Order, 'id' | 'created_at'>
        Update: Partial<Omit<Order, 'id' | 'created_at'>>
      }
    }
  }
}
