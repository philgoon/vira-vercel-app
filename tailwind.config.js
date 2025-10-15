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
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        headline: ['var(--font-poppins)', 'system-ui', 'sans-serif'],
      },
      colors: {
        // Theme Colors (shadcn/ui format using CSS variables)
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
        // Legacy Brand Colors (for backward compatibility)
        single: {
          50: '#E8F4F8',
          100: '#D1E9F1',
          500: '#1A5276',
          600: '#154466',
          700: '#103355',
          DEFAULT: '#1A5276',
        },
        throw: {
          50: '#F0F4F1',
          100: '#E1E9E3',
          500: '#6B8F71',
          600: '#567259',
          700: '#415641',
          DEFAULT: '#6B8F71',
        },
        marketing: {
          50: '#F1F1F1',
          100: '#E3E3E4',
          500: '#6E6F71',
          600: '#58595A',
          700: '#424243',
          DEFAULT: '#6E6F71',
        },
        sidebar: {
          DEFAULT: '#2C3E50',
          foreground: '#ECF0F1',
          primary: '#6B8F71',
          'primary-foreground': '#FFFFFF',
          accent: '#34495E',
          'accent-foreground': '#ECF0F1',
          border: '#34495E',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
    },
  },
  plugins: [],
}