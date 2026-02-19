export interface Film {
  film_id?: number;
  title: string;
  description?: string;
  release_year?: number;
  rental_rate?: number;
  length?: number;
  rating?: string;
  genre?: string;
  rental_count?: number;
  available_copies?: number;
  image_url?: string;   
  created_at?: string;
}

export interface Actor {
  actor_id: number;
  first_name: string;
  last_name: string;
  birth_date?: string;
  image_url?: string;  
  created_at?: string;
}

export interface Customer {
  customer_id?: number;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  address?: string;
  active?: boolean;
  created_at?: string;
}

export interface Rental {
  rental_id?: number;
  customer_id: number;
  film_id: number;
  rental_date?: string;
  return_date?: string | null;
  status?: 'rented' | 'returned';
}

export interface FilmWithActors extends Film {
  actors?: Actor[];
}

export interface CustomerWithRentals extends Customer {
  rentals?: Rental[];
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}