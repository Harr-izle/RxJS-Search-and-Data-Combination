import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { fromEvent, map, debounceTime, filter, startWith, switchMap, catchError, of, Observable, delay, combineLatest, timer } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'RxJs-Search';

  searchResults: string = '';
  combinedData: any;
  searchLoading: boolean = false; 
  combinedLoading: boolean = true; 
  error: string | null = null;
names: string[] = ['Denzel','Josephine','Reuben','Sam','Alberta','Louisa','Oriana'];

  onSearch(event: Event): void {
    const searchTerm = (event.target as HTMLInputElement).value.toLowerCase();

    this.searchLoading = true; 
    this.error = null;   

    fromEvent((event.target as HTMLInputElement), 'input').pipe(
      map(e => (e.target as HTMLInputElement).value.toLowerCase()),
      debounceTime(300),
      startWith(''), // Start with an empty search term
      filter(term => term.length === 0 || term.length >= 3), 
      switchMap(term => this.searchNames(term)),
      catchError(err => {
        this.error = 'Error fetching search results';
        this.searchLoading = false; 
        return of('');
      })
    ).subscribe(result => {
      if (result) {
        this.searchResults = result;
        this.error = null; 
      } else {
        this.searchResults = '';
        this.error = searchTerm.length === 0 ? null : 'Fruit not found'; 
      }
      this.searchLoading = false; 
    });
  }

  searchNames(term: string): Observable<string | null> {
    return of(this.names.find(name => name.toLowerCase() === term) || null).pipe(
      delay(1000)
    );
  }

  ngOnInit(): void {
    this.combinedLoading = true; 
    timer(2000).subscribe(() => this.combineDataStreams());
  }

  combineDataStreams(): void {
    this.combinedLoading = true; 

    const userDetails$ = of({ id: 1, name: 'Harriet Buadee', email: 'datgalharry@gmail.com' }).pipe(delay(1000));
    const userPosts$ = of([{ id: 1, title: 'Owner' }, { id: 2, title: 'CFO' }]).pipe(delay(1500));

    combineLatest([userDetails$, userPosts$]).pipe(
      map(([userDetails, userPosts]) => ({
        ...userDetails,
        posts: userPosts,
        displayNameAndEmail: `Name: ${userDetails.name}, Email: ${userDetails.email}` // Combine name and email for display
      })),
      catchError(err => {
        this.error = 'Error fetching combined data';
        this.combinedLoading = false;  
        return of(null);
      }),
      startWith(null)
    ).subscribe(data => {
      this.combinedData = data;
      this.combinedLoading = false;  
    });
  }
}
