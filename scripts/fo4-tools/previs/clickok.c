// clickok "<window title>" "<button text>" [seconds]: wait for a top-level window and click
// its button (BM_CLICK) until the window goes away. Logs to clickok.log next to the exe.
#include <windows.h>
#include <stdio.h>
static const wchar_t *want; static HWND found;
static BOOL CALLBACK child(HWND h, LPARAM l) {
    wchar_t t[256]; GetWindowTextW(h, t, 256);
    if (lstrcmpiW(t, want) == 0) { found = h; return FALSE; }
    return TRUE;
}
int wmain(int argc, wchar_t **argv) {
    if (argc < 3) return 2;
    FILE *log = _wfopen(L"clickok.log", L"a");
    int secs = argc > 3 ? _wtoi(argv[3]) : 60, clicks = 0;
    want = argv[2];
    if (lstrcmpW(want, L"__CLOSE__") == 0) { HWND w = FindWindowW(NULL, argv[1]); if (w) { PostMessageW(w, WM_CLOSE, 0, 0); fwprintf(log, L"close sent\n"); } fclose(log); return w ? 0 : 1; }
    for (int i = 0; i < secs; i++) {
        HWND w = FindWindowW(NULL, argv[1]);
        if (w) {
            found = NULL; EnumChildWindows(w, child, 0);
            if (found && IsWindowEnabled(found)) {
                Sleep(1500);
                SendMessageW(found, BM_CLICK, 0, 0);
                clicks++; fwprintf(log, L"click %d at %ds\n", clicks, i); fflush(log);
            }
        } else if (clicks) { fwprintf(log, L"window gone after %d clicks\n", clicks); break; }
        Sleep(1000);
    }
    fclose(log);
    return clicks ? 0 : 1;
}
