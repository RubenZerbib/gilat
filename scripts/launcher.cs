using System;
using System.Diagnostics;
using System.IO;
using System.Net;
using System.Threading;

class ClinicLauncher
{
    static string root;

    static int Main()
    {
        root = Path.GetDirectoryName(
            System.Reflection.Assembly.GetExecutingAssembly().Location
        );
        Directory.SetCurrentDirectory(root);

        Console.Title = "Clinic Form - Server";
        Console.OutputEncoding = System.Text.Encoding.UTF8;

        Banner();

        // ── 1. Node.js ───────────────────────────────
        if (!CommandExists("node"))
        {
            Error("Node.js is not installed or not in PATH.");
            Error("Download it from https://nodejs.org");
            Pause(); return 1;
        }
        Ok("Node.js found");

        // ── 2. Dependencies ──────────────────────────
        if (!Directory.Exists(Path.Combine(root, "node_modules")))
        {
            Status("Installing dependencies (first run)...");
            if (Run("npm", "install") != 0)
            {
                Error("npm install failed."); Pause(); return 1;
            }
        }
        Ok("Dependencies ready");

        // ── 3. .env ──────────────────────────────────
        string envFile = Path.Combine(root, ".env");
        string envExample = Path.Combine(root, ".env.example");
        if (!File.Exists(envFile) && File.Exists(envExample))
        {
            File.Copy(envExample, envFile);
        }
        Ok("Environment file ready");

        // ── 4. Database ──────────────────────────────
        Status("Preparing database...");
        Run("npx", "prisma generate", true);
        if (Run("npx", "prisma db push --skip-generate", true) != 0)
        {
            Error("Database setup failed."); Pause(); return 1;
        }
        Ok("Database ready");

        // ── 5. Start server & open browser ───────────
        Console.WriteLine();
        Status("Starting server on http://localhost:4300");
        Status("Close this window to stop the server.");
        Console.WriteLine();

        Process server = StartServer();

        Thread browserThread = new Thread(() => WaitAndOpen("http://localhost:4300", 60));
        browserThread.IsBackground = true;
        browserThread.Start();

        server.WaitForExit();
        return server.ExitCode;
    }

    // ── Helpers ──────────────────────────────────────

    static void Banner()
    {
        Console.ForegroundColor = ConsoleColor.Cyan;
        Console.WriteLine("╔══════════════════════════════════════════╗");
        Console.WriteLine("║   Clinic Medical Form Signing System    ║");
        Console.WriteLine("╚══════════════════════════════════════════╝");
        Console.ResetColor();
        Console.WriteLine();
    }

    static void Ok(string msg)
    {
        Console.ForegroundColor = ConsoleColor.Green;
        Console.Write("  [OK] ");
        Console.ResetColor();
        Console.WriteLine(msg);
    }

    static void Status(string msg)
    {
        Console.ForegroundColor = ConsoleColor.Yellow;
        Console.Write("  [*]  ");
        Console.ResetColor();
        Console.WriteLine(msg);
    }

    static void Error(string msg)
    {
        Console.ForegroundColor = ConsoleColor.Red;
        Console.Write("  [ERR] ");
        Console.ResetColor();
        Console.WriteLine(msg);
    }

    static void Pause()
    {
        Console.WriteLine();
        Console.WriteLine("  Press any key to exit...");
        Console.ReadKey(true);
    }

    static bool CommandExists(string cmd)
    {
        try
        {
            var psi = new ProcessStartInfo("where", cmd)
            {
                RedirectStandardOutput = true,
                RedirectStandardError = true,
                UseShellExecute = false,
                CreateNoWindow = true
            };
            var p = Process.Start(psi);
            p.WaitForExit();
            return p.ExitCode == 0;
        }
        catch { return false; }
    }

    static int Run(string file, string args, bool quiet = false)
    {
        try
        {
            var psi = new ProcessStartInfo("cmd.exe", "/c " + file + " " + args)
            {
                WorkingDirectory = root,
                UseShellExecute = false,
                RedirectStandardOutput = quiet,
                RedirectStandardError = quiet
            };
            var p = Process.Start(psi);
            p.WaitForExit();
            return p.ExitCode;
        }
        catch (Exception ex)
        {
            Error(ex.Message);
            return 1;
        }
    }

    static Process StartServer()
    {
        var psi = new ProcessStartInfo("cmd.exe", "/c npm run dev")
        {
            WorkingDirectory = root,
            UseShellExecute = false
        };
        return Process.Start(psi);
    }

    static void WaitAndOpen(string url, int timeoutSec)
    {
        int elapsed = 0;
        int interval = 800;

        while (elapsed < timeoutSec * 1000)
        {
            try
            {
                var req = (HttpWebRequest)WebRequest.Create(url);
                req.Timeout = 2000;
                req.Method = "HEAD";
                using (var resp = (HttpWebResponse)req.GetResponse())
                {
                    if ((int)resp.StatusCode < 400)
                    {
                        Console.WriteLine();
                        Ok("Server is up! Opening browser...");
                        Console.WriteLine();
                        Process.Start(new ProcessStartInfo(url) { UseShellExecute = true });
                        return;
                    }
                }
            }
            catch { /* not ready yet */ }

            Thread.Sleep(interval);
            elapsed += interval;
        }

        Error("Timed out waiting for server.");
    }
}
