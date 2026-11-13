# Rubryka oceny odpowiedzi

Polish Eval Lab służy do ćwiczenia porównywania dwóch odpowiedzi na jedno polecenie. Oceń każdą odpowiedź oddzielnie, a potem wybierz preferowaną. Uzasadnienie powinno wskazywać konkretny fragment odpowiedzi i wymaganie z polecenia.

## Pochodzenie materiału

Zestaw zawiera 12 autorskich, syntetycznych ćwiczeń przygotowanych z pomocą AI. Polecenia i obie odpowiedzi napisano na potrzeby projektu. Nie są to odpowiedzi zebrane z rzeczywistych modeli, materiały Alignerr ani zadania z rekrutacji. Projekt jest niezależnym ćwiczeniem portfolio i nie jest powiązany z Alignerr.

Pole `reference` zawiera **przykładowe omówienie przygotowane przez AI**, a nie oficjalny klucz, rozstrzygający wzorzec jakości ani ocenę wykonaną przez Natalię. Oceniająca może uzasadnić inną decyzję. Zgodność z omówieniami nie jest miarą gotowości zawodowej ani szans na przyjęcie do projektu. Wszystkie własne oceny należy wykonać samodzielnie i podpisać zgodnie z ich rzeczywistym autorstwem.

## Skala od 1 do 5

Poniższe cztery kryteria są odrębne. Przykładowo odpowiedź może być płynna językowo, a jednocześnie zawierać błędne obliczenie. Nie podnoś oceny poprawności tylko dlatego, że tekst brzmi przekonująco.

| Kryterium | 1 | 2 | 3 | 4 | 5 |
| --- | --- | --- | --- | --- | --- |
| **Poprawność** (`accuracy`) | Główna odpowiedź przeczy danym lub opiera się na zmyśleniu. | Poważny błąd zmienia odpowiedź; część faktów jest poprawna. | Częściowo poprawna, ale zawiera istotną lukę lub błąd. | Poprawna zasadniczo; drobna niedokładność nie zmienia wniosku. | Zgodna z dostępnymi danymi; obliczenia i wnioski są poprawne, brak niepopartych twierdzeń. |
| **Zgodność z instrukcją** (`instructions`) | Nie wykonuje głównego zadania. | Narusza kluczowe, jednoznaczne wymaganie. | Wykonuje główną część zadania, lecz pomija ważny warunek. | Drobne odstępstwo od formatu bez zmiany istotnego wyniku. | Spełnia wszystkie wymagania dotyczące treści, zakresu, formatu i ograniczeń. |
| **Język i klarowność** (`language`) | Tekst jest w większości niezrozumiały. | Liczne błędy lub niejasności utrudniają odczytanie sensu. | Zrozumiały, ale wyraźnie wymaga korekty. | Jasny i poprawny; pojedyncza drobna usterka. | Naturalna, poprawna polszczyzna, czytelna struktura i ton odpowiedni do zadania. |
| **Użyteczność** (`usefulness`) | Nie pomaga zrealizować celu użytkownika. | Wymaga dużego uzupełnienia, aby można było z niej skorzystać. | Częściowo pomocna, lecz pomija potrzebne informacje lub kroki. | Przydatna i niemal kompletna; ma niewielkie braki. | Bezpośrednio pomaga osiągnąć cel, jest kompletna w dostępnym kontekście i bez zbędnych dodatków. |

Ocena 5 nie wymaga długiej odpowiedzi. Gdy danych brakuje, jasne przyznanie tego i trafne pytanie uzupełniające może zasługiwać na wysoką ocenę. Nie karz odpowiedzi za brak informacji, których nie można uzyskać z zadania. Zachowuj te same kryteria dla A i B.

## Wybór preferencji

- **A** — odpowiedź A lepiej realizuje cel i wymagania.
- **B** — odpowiedź B lepiej realizuje cel i wymagania.
- **Remis** (`tie`) — nie ma istotnej różnicy jakości albo różne zalety równoważą się w tym kontekście. Nie używaj remisu jako zamiennika braku decyzji.
- **Pomiń** (`skip`) — nie oceniasz tej pary, np. nie rozumiesz polecenia lub potrzebujesz wiedzy, której nie masz. Zaznacz powód; pominięcie nie jest remisem ani ukończoną oceną.

Nie wybieraj preferencji automatycznie według średniej arytmetycznej. Błąd zmieniający główny wynik może przeważyć nad płynniejszym stylem. Dwie różne, poprawne odpowiedzi mogą zasługiwać na remis.

## Flagi istotnych problemów

Flagi są oddzielne od ocen liczbowych. Zaznaczaj je dla konkretnej odpowiedzi, gdy problem ma znaczenie dla wykonania zadania. W uzasadnieniu wskaż, gdzie występuje. Drobna niezręczność stylistyczna nie jest automatycznie problemem krytycznym.

| Identyfikator | Co oznacza | Przykład |
| --- | --- | --- |
| `factual_error` | Twierdzenie lub obliczenie jest sprzeczne z danymi. | Wynik dzielenia 65 przez 5 podany jako 12. |
| `unsupported_claim` | Odpowiedź dopisuje informację, której nie uzasadnia dostępny materiał. | Pewna godzina odjazdu mimo braku rozkładu i dostępu do internetu. |
| `instruction_violation` | Naruszono kluczowy, wyraźny warunek polecenia. | Przetłumaczono etykiety przycisków, które miały pozostać niezmienione. |
| `meaning_change` | Zmieniono sens materiału źródłowego. | „Nie synchronizuje” zamieniono na „synchronizuje”. |

Może pasować więcej niż jedna flaga; nie trzeba dodawać wszystkich podobnych flag do jednego problemu. Sama liczba flag nie jest oceną jakości. Brak flagi nie oznacza, że odpowiedź jest dobra lub kompletna.

## Jak napisać uzasadnienie

Połącz trzy elementy: **wymaganie → obserwacja → wpływ na decyzję**. Wystarczą zwykle 2–4 zdania.

Przykład: „Polecenie wymaga zachowania angielskich etykiet. A zmienia ‘Save’ na ‘Zapisz’, a B zachowuje oryginalną nazwę. Wybieram B, ponieważ lepiej odpowiada interfejsowi opisanemu w zadaniu. Pozostałe kroki w obu odpowiedziach są zrozumiałe”.

Unikaj uzasadnień typu „B jest lepsza” bez wskazania powodu. Nie dopisuj sprawdzenia w internecie, jeśli go nie wykonano. W tych ćwiczeniach rozstrzygające informacje zawiera polecenie; zadania o niepewności celowo pozostawiają dane niepełne.

## Zalecany przebieg jednej oceny

1. Przeczytaj polecenie i zauważ ograniczenia.
2. Przeczytaj A i B, zanim zaczniesz punktować.
3. Oceń cztery kryteria dla każdej odpowiedzi i zaznacz istotne problemy.
4. Wybierz A, B, remis lub pominięcie oraz zapisz własne uzasadnienie.
5. Dopiero po zapisaniu decyzji zajrzyj do przykładowego omówienia.
6. Jeśli zmieniasz decyzję, zachowaj przejrzysty opis, co wpłynęło na zmianę.

Projekt dostarcza ćwiczenia i narzędzie. Własną częścią portfolio są dopiero rzeczywiście wykonane oceny, uzasadnienia i refleksja nad decyzjami. Nie przedstawiaj danych demonstracyjnych jako ukończonej pracy zawodowej.
