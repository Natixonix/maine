/*
 * Polish Eval Lab — autorskie, syntetyczne ćwiczenia przygotowane z pomocą AI.
 * Teksty nie pochodzą z Alignerr, zadań rekrutacyjnych ani rzeczywistych modeli.
 * reference to przykładowe omówienie, a nie oficjalny klucz lub wynik Natalii.
 * Oceniająca może uzasadnić inną decyzję; nie istnieje tu próg rekrutacyjny.
 */
window.PEL_CASES = [
  {
    id: "PEL-001",
    category: "Zgodność z instrukcją",
    title: "Dokładnie trzy punkty",
    prompt: "Na podstawie poniższych danych napisz dokładnie trzy wypunktowania, bez wstępu i zakończenia. Połącz informacje, jeśli to potrzebne. Dane: wystawa jest otwarta od 10:00 do 18:00; wstęp jest bezpłatny; nie trzeba się zapisywać; oprowadzanie trwa 30 minut; przewodnik czeka przy recepcji.",
    responseA: "• Wystawa jest otwarta od 10:00 do 18:00.\n• Wstęp jest bezpłatny i nie wymaga wcześniejszych zapisów.\n• Oprowadzanie trwa 30 minut, a przewodnik czeka na uczestników przy recepcji.",
    responseB: "Oto najważniejsze informacje o wystawie:\n• Godziny otwarcia: od 10:00 do 18:00.\n• Wstęp jest bezpłatny.\n• Wcześniejsze zapisy nie są potrzebne.\n• Oprowadzanie trwa 30 minut; przewodnik czeka przy recepcji.",
    reference: {
      preferred: "A",
      reason: "A przekazuje wszystkie podane informacje w dokładnie trzech punktach, bez wstępu. B zachowuje fakty, lecz dodaje wstęp i czwarty punkt, naruszając wyraźne wymaganie dotyczące formatu. To przykładowe omówienie; w uzasadnieniu warto wskazać konkretne naruszenie.",
      criticalIssuesA: [],
      criticalIssuesB: ["instruction_violation"]
    }
  },
  {
    id: "PEL-002",
    category: "Poprawność",
    title: "Termin, którego nie podano",
    prompt: "Odczytaj notatkę i podaj numer zgłoszenia, status oraz termin dostawy. Jeśli informacji brakuje, napisz „nie podano”. Notatka: „Zgłoszenie ZP-204. Paczka została spakowana i czeka na odbiór przez przewoźnika. Nadawca prosi o wiadomość po jej przekazaniu. Termin dostawy nie jest jeszcze ustalony”.",
    responseA: "Numer zgłoszenia: ZP-204. Status: paczka spakowana, oczekuje na odbiór przez przewoźnika. Termin dostawy: najbliższy piątek. Po przekazaniu paczki należy poinformować nadawcę; doręczenie powinno nastąpić zgodnie z podanym terminem.",
    responseB: "Numer zgłoszenia: ZP-204. Status: paczka spakowana, oczekuje na odbiór przez przewoźnika. Termin dostawy: nie podano. Notatka zawiera prośbę o powiadomienie nadawcy po przekazaniu paczki, ale nie określa dnia doręczenia.",
    reference: {
      preferred: "B",
      reason: "B poprawnie odczytuje dane i zaznacza brak terminu. A dopisuje piątek, mimo że notatka nie zawiera daty i mówi o nieustalonym terminie. To nie wniosek z danych, lecz niepoparta informacja. Omówienie jest przykładowe, nie stanowi oficjalnego klucza.",
      criticalIssuesA: ["unsupported_claim"],
      criticalIssuesB: []
    }
  },
  {
    id: "PEL-003",
    category: "Poprawność",
    title: "Zachowanie zaprzeczenia w streszczeniu",
    prompt: "Streść poniższą notatkę w dwóch zdaniach, zachowując informacje o działaniu bez internetu, eksporcie i synchronizacji. Notatka: „Notatnik 2.1 działa bez połączenia z internetem. Zapisane wpisy można eksportować do pliku JSON. Ta wersja nie synchronizuje danych między urządzeniami. Instalator zajmuje 14 MB”.",
    responseA: "Notatnik 2.1 działa bez połączenia z internetem i pozwala eksportować zapisane wpisy do pliku JSON. Ta wersja nie synchronizuje danych między urządzeniami, a jej instalator zajmuje 14 MB.",
    responseB: "Notatnik 2.1 działa bez połączenia z internetem i pozwala eksportować zapisane wpisy do pliku JSON. Po uzyskaniu połączenia synchronizuje dane między urządzeniami, a jego instalator zajmuje 14 MB.",
    reference: {
      preferred: "A",
      reason: "A zachowuje znaczenie notatki, w tym wyraźny brak synchronizacji. B przypisuje aplikacji synchronizację po połączeniu z internetem, choć źródło temu przeczy. Obie wersje mają po dwa zdania, więc o wyborze decyduje poprawność treści. To przykładowe omówienie.",
      criticalIssuesA: [],
      criticalIssuesB: ["factual_error", "meaning_change"]
    }
  },
  {
    id: "PEL-004",
    category: "Poprawność",
    title: "Dwa kroki obliczenia",
    prompt: "W pracowni jest 7 pudełek, a w każdym 12 ołówków. Wydano 19 ołówków. Pozostałe trzeba rozdzielić po równo, po 5 ołówków w zestawie. Ile ołówków zostało i ile pełnych zestawów można przygotować? Pokaż krótkie obliczenie.",
    responseA: "Na początku było 7 × 12 = 84 ołówki. Po wydaniu 19 zostało 84 − 19 = 65 ołówków. Z tej liczby można przygotować 12 pełnych zestawów po 5 ołówków, bez reszty.",
    responseB: "Na początku było 7 × 12 = 84 ołówki. Po wydaniu 19 zostało 84 − 19 = 65 ołówków. Ponieważ 65 ÷ 5 = 13, można przygotować 13 pełnych zestawów, bez reszty.",
    reference: {
      preferred: "B",
      reason: "B poprawnie liczy oba etapy: 84 − 19 = 65 oraz 65 ÷ 5 = 13. A prawidłowo oblicza pozostałe ołówki, lecz podaje 12 zestawów bez reszty; 12 × 5 to tylko 60. Przykładowe omówienie opiera się wyłącznie na danych z polecenia.",
      criticalIssuesA: ["factual_error"],
      criticalIssuesB: []
    }
  },
  {
    id: "PEL-005",
    category: "Poprawność",
    title: "Właściwy mianownik",
    prompt: "Zespół wykonał 30 prób: 18 zaakceptowano, 8 odesłano do poprawy, a 4 czekają na sprawdzenie. Jaki procent wszystkich 30 prób został zaakceptowany? Nie usuwaj z obliczenia prób oczekujących. Wyjaśnij wynik w dwóch lub trzech zdaniach.",
    responseA: "Zaakceptowano 18 spośród wszystkich 30 prób, więc udział wynosi 18 ÷ 30 × 100% = 60%. Próby oczekujące pozostają w mianowniku, ponieważ pytanie dotyczy całego zestawu, a nie tylko sprawdzonych prób.",
    responseB: "Najpierw odejmujemy 4 próby oczekujące, co daje 26 sprawdzonych prób. Następnie 18 ÷ 26 × 100% ≈ 69,2%, więc taki jest odsetek zaakceptowanych prób. Ten wynik lepiej pokazuje skuteczność ukończonej oceny.",
    reference: {
      preferred: "A",
      reason: "A odpowiada na zadane pytanie: 18 z 30 to 60%. Działanie B jest poprawne dla innego mianownika, lecz użytkownik wyraźnie zabronił wyłączania prób oczekujących. Nie należy zmieniać definicji miernika tylko dlatego, że inny wynik wydaje się ciekawszy. To przykładowe omówienie.",
      criticalIssuesA: [],
      criticalIssuesB: ["instruction_violation"]
    }
  },
  {
    id: "PEL-006",
    category: "Język polski",
    title: "Zgoda gramatyczna w wiadomości",
    prompt: "Popraw polszczyznę wiadomości, zachowując jej znaczenie. Zwróć wyłącznie poprawioną wiadomość. Tekst: „Dzień dobry, pięć zgłoszeń zostały już sprawdzone, a pozostałe czekają na ocenę. Proszę o przesłanie tą instrukcję do zespołu. Zależy nam na zachowaniu tej samej kolejności zadań”.",
    responseA: "Dzień dobry, pięć zgłoszeń zostały już sprawdzone, a pozostałe czekają na ocenę. Proszę o przesłanie tej instrukcji do zespołu. Zależy nam na zachowaniu tej samej kolejności zadań.",
    responseB: "Dzień dobry, pięć zgłoszeń zostało już sprawdzonych, a pozostałe czekają na ocenę. Proszę o przesłanie tej instrukcji do zespołu. Zależy nam na zachowaniu tej samej kolejności zadań.",
    reference: {
      preferred: "B",
      reason: "B poprawia zarówno formę „tej instrukcji”, jak i zgodę gramatyczną: „pięć zgłoszeń zostało sprawdzonych”. A naprawia tylko drugi fragment, pozostawiając „pięć zgłoszeń zostały”. Znaczenie wiadomości pozostaje takie samo; usterkę można ocenić w wymiarze języka bez flagi krytycznej. To przykładowe omówienie.",
      criticalIssuesA: [],
      criticalIssuesB: []
    }
  },
  {
    id: "PEL-007",
    category: "Język polski",
    title: "Dwa poprawne warianty",
    prompt: "Napisz uprzejmą, neutralną wiadomość do współpracownika. Przekaż, że spotkanie przeniesiono z 11:00 na 12:30, sala pozostaje ta sama i potrzebne jest potwierdzenie otrzymania informacji. Nie dodawaj powodu zmiany ani nowych ustaleń.",
    responseA: "Cześć, informuję, że spotkanie zostało przeniesione z godziny 11:00 na 12:30. Odbędzie się w tej samej sali. Proszę o potwierdzenie otrzymania tej wiadomości. Dziękuję za odpowiedź.",
    responseB: "Cześć, nasze spotkanie zacznie się o 12:30 zamiast o 11:00. Sala nie ulega zmianie. Daj proszę znać, że wiadomość do Ciebie dotarła. Dziękuję za potwierdzenie odbioru.",
    reference: {
      preferred: "tie",
      reason: "Obie odpowiedzi zachowują godziny, niezmienioną salę i prośbę o potwierdzenie. Są uprzejme, zrozumiałe i nie dopisują przyczyny zmiany. Różnica między „proszę o potwierdzenie” a „daj proszę znać” nie przesądza o jakości w podanym kontekście. Remis jest przykładową, uzasadnioną decyzją.",
      criticalIssuesA: [],
      criticalIssuesB: []
    }
  },
  {
    id: "PEL-008",
    category: "Użyteczność",
    title: "Raport błędu, który można odtworzyć",
    prompt: "Przygotuj krótki raport z krokami, wynikiem oczekiwanym i rzeczywistym. Obserwacja: na komputerze w Chrome użytkownik otwiera profil, zmienia nazwę i klika Zapisz. Widzi nową nazwę. Po odświeżeniu strony wraca stara nazwa. Wystąpiło to w dwóch próbach na dwie. Wersji przeglądarki ani przyczyny błędu nie znamy.",
    responseA: "Tytuł: zmiana nazwy profilu nie utrzymuje się po odświeżeniu.\nŚrodowisko: komputer, Chrome; wersja niepodana.\nKroki: otwórz profil, zmień nazwę, kliknij Zapisz, odśwież stronę.\nOczekiwane: nowa nazwa pozostaje zapisana.\nRzeczywiste: wraca poprzednia nazwa.\nPowtarzalność: 2/2 próby. Przyczyna nieustalona.",
    responseB: "Tytuł: problem z profilem.\nAplikacja zachowuje się nieprawidłowo podczas pracy z nazwą użytkownika. Należy sprawdzić zapis i odświeżanie, ponieważ zmiana nie utrzymuje się. Użytkownik powinien widzieć właściwą nazwę. Problem wystąpił w Chrome i wymaga dalszej analizy.",
    reference: {
      preferred: "A",
      reason: "A zamienia obserwację w odtwarzalny raport i zachowuje środowisko, 2/2 próby oraz rozróżnienie oczekiwanego i rzeczywistego wyniku. B nie zmyśla przyczyny, ale pomija wymagane kroki odtworzenia i powtarzalność. Brak kroków narusza wyraźny wymóg polecenia. To przykładowe omówienie, nie jedyna dopuszczalna ocena.",
      criticalIssuesA: [],
      criticalIssuesB: ["instruction_violation"]
    }
  },
  {
    id: "PEL-009",
    category: "Użyteczność",
    title: "Różne plany, ten sam cel",
    prompt: "Zaproponuj plan 20-minutowej sesji oceny jednej pary odpowiedzi AI. Plan ma uwzględniać przeczytanie polecenia, porównanie odpowiedzi pod kątem poprawności, instrukcji, języka i użyteczności, zapisanie uzasadnienia oraz końcowe sprawdzenie oceny. Rozdział minut jest dowolny, ale łącznie musi dawać 20.",
    responseA: "3 minuty: przeczytaj polecenie i zaznacz wymagania. 10 minut: porównaj obie odpowiedzi pod kątem poprawności, zgodności z instrukcją, języka i użyteczności. 5 minut: zapisz oceny i uzasadnienie oparte na konkretnych fragmentach. 2 minuty: sprawdź spójność decyzji. Łącznie: 20 minut.",
    responseB: "2 minuty: przeczytaj polecenie i wypisz najważniejsze ograniczenia. 12 minut: przeanalizuj poprawność, instrukcje, język i użyteczność obu odpowiedzi. 4 minuty: zanotuj oceny oraz uzasadnienie z przykładami. Ostatnie 2 minuty przeznacz na końcowe sprawdzenie decyzji. Łącznie: 20 minut.",
    reference: {
      preferred: "tie",
      reason: "Oba plany sumują się do 20 minut i obejmują wszystkie wymagane etapy oraz cztery kryteria. Polecenie dopuszcza dowolny rozdział czasu. Bez dodatkowych potrzeb użytkownika nie ma podstaw, by uznać jedną proporcję minut za lepszą. Remis to przykładowe omówienie, a nie obowiązkowa odpowiedź.",
      criticalIssuesA: [],
      criticalIssuesB: []
    }
  },
  {
    id: "PEL-010",
    category: "Niepewność",
    title: "Brak aktualnego rozkładu",
    prompt: "Użytkownik pyta: „O której dziś odjeżdża najbliższy autobus z mojego przystanku do centrum?”. Masz tylko wiadomość „mój przystanek to Parkowa”, bez miasta, linii, bieżącej godziny ani rozkładu. W tym ćwiczeniu nie masz dostępu do internetu. Odpowiedz pomocnie, nie wymyślając danych.",
    responseA: "Najbliższy autobus z przystanku Parkowa do centrum odjeżdża dziś o 14:20. Następne kursy są co 15 minut, więc jeśli nie zdążysz, możesz pojechać o 14:35. Najlepiej przyjdź na przystanek kilka minut wcześniej.",
    responseB: "Nie mogę ustalić najbliższego odjazdu z samych tych danych. Podaj miasto, numer linii i bieżącą godzinę oraz wklej aktualny rozkład lub jego zdjęcie. Wtedy pomogę wskazać właściwy kurs. Nie mam tu dostępu do aktualnego rozkładu online.",
    reference: {
      preferred: "B",
      reason: "B ujawnia ograniczenie i prosi o dane pozwalające rzeczywiście pomóc. A podaje godziny i częstotliwość bez podstaw. Sama nazwa przystanku nie identyfikuje miasta ani linii, a ćwiczenie wyklucza dostęp do internetu. To przykładowe omówienie oceny niepewności, nie informacja o prawdziwym rozkładzie.",
      criticalIssuesA: ["unsupported_claim"],
      criticalIssuesB: []
    }
  },
  {
    id: "PEL-011",
    category: "Niepewność",
    title: "Niejednoznaczne słowo",
    prompt: "Użytkownik prosi o wierne tłumaczenie zdania „Trzeba naprawić zamek” na angielski. Nie wiadomo, czy chodzi o drzwi, kurtkę, czy budowlę. Odpowiedz krótko, zaznaczając niejednoznaczność i pomagając wybrać właściwe tłumaczenie.",
    responseA: "Słowo „zamek” wymaga kontekstu. Dla drzwi: „The lock needs to be repaired”. Dla kurtki: „The zipper needs to be repaired”. Dla budowli: „The castle needs to be repaired”. O który przedmiot chodzi?",
    responseB: "Poprawne tłumaczenie brzmi: „The lock needs to be repaired”. W tym zdaniu słowo „zamek” jednoznacznie oznacza mechanizm w drzwiach, dlatego nie trzeba dopytywać o kontekst ani rozważać innych znaczeń.",
    reference: {
      preferred: "A",
      reason: "A rozpoznaje trzy znaczenia i proponuje tłumaczenia zależne od kontekstu. B wybiera możliwe tłumaczenie, ale bezpodstawnie przedstawia je jako jedyne i twierdzi, że kontekst nie jest potrzebny. Ocenie podlega także sposób wyrażenia pewności. To przykładowe omówienie, z którym można rzeczowo polemizować.",
      criticalIssuesA: [],
      criticalIssuesB: ["unsupported_claim"]
    }
  },
  {
    id: "PEL-012",
    category: "Zgodność z instrukcją",
    title: "Nazwy przycisków muszą zostać bez zmian",
    prompt: "Napisz po polsku krótką instrukcję w trzech numerowanych krokach. Dane: plik wybiera się przyciskiem „Choose file”, zapisuje przyciskiem „Save”, a okno zamyka przyciskiem „Close”. Zachowaj dokładnie angielskie nazwy przycisków. Nie dodawaj czynności spoza danych.",
    responseA: "1. Kliknij przycisk „Wybierz plik”, aby wskazać plik, który chcesz zapisać.\n2. Następnie użyj przycisku „Zapisz”, aby zapisać wybrany plik.\n3. Na końcu kliknij „Zamknij”, aby zamknąć okno.",
    responseB: "1. Kliknij przycisk „Choose file”, aby wskazać plik, który chcesz zapisać.\n2. Następnie użyj przycisku „Save”, aby zapisać wybrany plik.\n3. Na końcu kliknij „Close”, aby zamknąć okno.",
    reference: {
      preferred: "B",
      reason: "B zachowuje nazwy przycisków dokładnie tak, jak wymaga polecenie. A ma poprawną polszczyznę i właściwą kolejność kroków, lecz tłumaczy etykiety, które miały pozostać po angielsku. W instrukcji obsługi takie dopasowanie pomaga znaleźć właściwy przycisk. To przykładowe omówienie.",
      criticalIssuesA: ["instruction_violation"],
      criticalIssuesB: []
    }
  }
];
