using System;
using System.Diagnostics;
using System.IO;
using System.Net.Sockets;
using System.Threading;

class ClinicLauncher
{
    static string root;
    const int PORT = 4300;

    static int Main()
    {
        root = Path.GetDirectoryName(
            System.Reflection.Assembly.GetExecutingAssembly().Location
        );
        Directory.SetCurrentDirectory(root);

        Console.Title = "Clinic Form - Server";
        Console.OutputEncoding = System.Text.Encoding.UTF8;

        Banner();

        if (!CommandExists("node"))
        {
            Error("Node.js is not installed or not in PATH.");
            Error("Download it from https://nodejs.org");
            Pause(); return 1;
        }
        Ok("Node.js found");

        if (!Directory.Exists(Path.Combine(root, "node_modules")))
        {
            Status("Installing dependencies (first run)...");
            if (Run("npm", "install") != 0)
            {
                Error("npm install failed."); Pause(); return 1;
            }
        }
        Ok("Dependencies ready");

        string envFile = Path.Combine(root, ".env");
        string envExample = Path.Combine(root, ".env.example");
        if (!File.Exists(envFile) && File.Exists(envExample))
        {
            File.Copy(envExample, envFile);
        }
        Ok("Environment file ready");

        Status("Preparing database...");
        Run("npx", "prisma generate", true);
        if (Run("npx", "prisma db push --skip-generate", true) != 0)
        {
            Error("Database setup failed."); Pause(); return 1;
        }
        Ok("Database ready");

        Console.WriteLine();
        Status("Starting server on http://localhost:" + PORT);
        Status("Close this window to stop the server.");
        Console.WriteLine();

        Process server = StartServer();

        Thread browserThread = new Thread(() => WaitForPortAndOpen(PORT, 120));
        browserThread.IsBackground = true;
        browserThread.Start();

        server.WaitForExit();
        return server.ExitCode;
    }

    static void Banner()
    {
        Console.ForegroundColor = ConsoleColor.Cyan;
        Console.WriteLine("======================================");
        Console.WriteLine("  Clinic Medical Form Signing System  ");
        Console.WriteLine("======================================");
        Console.ResetColor();
        Console.WriteLine();
    }

    static void Ok(string msg)
    {
        Console.ForegroundColor = ConsoleColor.Green;
        Console.Write("  [OK]  ");
        Console.ResetColor();
        Console.WriteLine(msg);
    }

    static void Status(string msg)
    {
        Console.ForegroundColor = ConsoleColor.Yellow;
        Console.Write("  [*]   ");
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

    static void WaitForPortAndOpen(int port, int timeoutSec)
    {
        int elapsed = 0;
        int interval = 600;

        while (elapsed < timeoutSec * 1000)
        {
            try
            {
                using (var tcp = new TcpClient())
                {
                    tcp.Connect("127.0.0.1", port);
                    tcp.Close();
                }

                Console.WriteLine();
                Ok("Server is up! Opening browser...");
                Console.WriteLine();

                string url = "http://localhost:" + port;
                Process.Start(new ProcessStartInfo(url) { UseShellExecute = true });
                return;
            }
            catch
            {
                // port not listening yet
            }

            Thread.Sleep(interval);
            elapsed += interval;
        }

        Error("Timed out waiting for server.");
    }
}
