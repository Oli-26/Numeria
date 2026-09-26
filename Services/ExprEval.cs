using System.Globalization;

namespace MathVoyager.Services;

// Tiny evaluator for data-driven graph widgets: numbers, named variables, + - * / ^,
// unary minus, parentheses and a few functions. Returns NaN on anything it cannot parse.
public static class ExprEval
{
    public static double Eval(string expr, IReadOnlyDictionary<string, double> vars)
    {
        try
        {
            var p = new Parser(expr, vars);
            var v = p.ParseExpr();
            p.SkipWs();
            return p.AtEnd ? v : double.NaN;
        }
        catch
        {
            return double.NaN;
        }
    }

    private sealed class Parser
    {
        private readonly string _s;
        private readonly IReadOnlyDictionary<string, double> _vars;
        private int _i;

        public Parser(string s, IReadOnlyDictionary<string, double> vars) { _s = s; _vars = vars; }

        public bool AtEnd => _i >= _s.Length;
        public void SkipWs() { while (_i < _s.Length && char.IsWhiteSpace(_s[_i])) _i++; }
        private bool Eat(char c) { SkipWs(); if (_i < _s.Length && _s[_i] == c) { _i++; return true; } return false; }

        public double ParseExpr()
        {
            var v = ParseTerm();
            while (true)
            {
                if (Eat('+')) v += ParseTerm();
                else if (Eat('-')) v -= ParseTerm();
                else return v;
            }
        }

        private double ParseTerm()
        {
            var v = ParseUnary();
            while (true)
            {
                if (Eat('*')) v *= ParseUnary();
                else if (Eat('/')) v /= ParseUnary();
                else return v;
            }
        }

        private double ParseUnary()
        {
            if (Eat('-')) return -ParseUnary();
            if (Eat('+')) return ParseUnary();
            return ParsePower();
        }

        // Right-associative, binds tighter than unary minus on its left: -2^2 = -4.
        private double ParsePower()
        {
            var b = ParseAtom();
            if (Eat('^')) return Math.Pow(b, ParseUnary());
            return b;
        }

        private double ParseAtom()
        {
            SkipWs();
            if (Eat('('))
            {
                var v = ParseExpr();
                if (!Eat(')')) throw new FormatException();
                return v;
            }
            var start = _i;
            if (_i < _s.Length && (char.IsDigit(_s[_i]) || _s[_i] == '.'))
            {
                while (_i < _s.Length && (char.IsDigit(_s[_i]) || _s[_i] == '.')) _i++;
                if (_i < _s.Length && (_s[_i] == 'e' || _s[_i] == 'E') && _i + 1 < _s.Length && (char.IsDigit(_s[_i + 1]) || _s[_i + 1] == '-'))
                {
                    _i += 2;
                    while (_i < _s.Length && char.IsDigit(_s[_i])) _i++;
                }
                return double.Parse(_s[start.._i], CultureInfo.InvariantCulture);
            }
            while (_i < _s.Length && (char.IsLetterOrDigit(_s[_i]) || _s[_i] == '_')) _i++;
            var name = _s[start.._i];
            if (name.Length == 0) throw new FormatException();

            if (Eat('('))
            {
                var args = new List<double> { ParseExpr() };
                while (Eat(',')) args.Add(ParseExpr());
                if (!Eat(')')) throw new FormatException();
                return name switch
                {
                    "exp" => Math.Exp(args[0]),
                    "ln" or "log" => Math.Log(args[0]),
                    "log10" => Math.Log10(args[0]),
                    "sqrt" => Math.Sqrt(args[0]),
                    "sin" => Math.Sin(args[0]),
                    "cos" => Math.Cos(args[0]),
                    "abs" => Math.Abs(args[0]),
                    "min" => args.Min(),
                    "max" => args.Max(),
                    "pow" => Math.Pow(args[0], args[1]),
                    _ => throw new FormatException()
                };
            }
            if (name == "pi") return Math.PI;
            if (name == "e") return Math.E;
            return _vars.TryGetValue(name, out var val) ? val : throw new FormatException();
        }
    }
}
