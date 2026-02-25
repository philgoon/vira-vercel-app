/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--stm-font-body)'],
        headline: ['var(--stm-font-headline)'],
        wordmark: ['var(--stm-font-wordmark)'],
        mono: ['var(--stm-font-mono)'],
      },
      colors: {
        // Theme Colors (shadcn/ui bridge -> STM tokens)
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        // Status Colors
        success: 'hsl(var(--success))',
        warning: 'hsl(var(--warning))',
        // Chart Colors
        chart: {
          1: 'hsl(var(--chart-1))',
          2: 'hsl(var(--chart-2))',
          3: 'hsl(var(--chart-3))',
          4: 'hsl(var(--chart-4))',
          5: 'hsl(var(--chart-5))',
        },
        // STM Brand Colors (direct token references)
        single: {
          50: 'var(--stm-single-50)',
          100: 'var(--stm-single-100)',
          500: 'var(--stm-single-500)',
          600: 'var(--stm-single-600)',
          700: 'var(--stm-single-700)',
          DEFAULT: 'var(--stm-single)',
        },
        throw: {
          50: 'var(--stm-throw-50)',
          100: 'var(--stm-throw-100)',
          500: 'var(--stm-throw-500)',
          600: 'var(--stm-throw-600)',
          700: 'var(--stm-throw-700)',
          DEFAULT: 'var(--stm-throw)',
        },
        marketing: {
          50: 'var(--stm-marketing-50)',
          100: 'var(--stm-marketing-100)',
          500: 'var(--stm-marketing-500)',
          600: 'var(--stm-marketing-600)',
          700: 'var(--stm-marketing-700)',
          DEFAULT: 'var(--stm-marketing)',
        },
        sidebar: {
          DEFAULT: 'var(--stm-sidebar)',
          foreground: 'var(--stm-sidebar-foreground)',
          primary: 'var(--stm-sidebar-primary)',
          'primary-foreground': 'var(--stm-sidebar-primary-foreground)',
          accent: 'var(--stm-sidebar-accent)',
          'accent-foreground': 'var(--stm-sidebar-accent-foreground)',
          border: 'var(--stm-sidebar-border)',
        },
      },
      borderRadius: {
        lg: 'var(--stm-radius-lg)',
        md: 'var(--stm-radius-md)',
        sm: 'var(--stm-radius-sm)',
        xl: 'var(--stm-radius-xl)',
      },
      boxShadow: {
        sm: 'var(--stm-shadow-sm)',
        md: 'var(--stm-shadow-md)',
        lg: 'var(--stm-shadow-lg)',
        xl: 'var(--stm-shadow-xl)',
      },
    },
  },
  plugins: [],
}
