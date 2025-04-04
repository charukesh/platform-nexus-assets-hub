
import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				},
				// Neumorphic color extensions
				neugray: {
					50: '#f7f8fa',  // Added the missing 50 shade
					100: '#f0f2f5',
					200: '#e6e9ed',
					300: '#dde0e4',
					400: '#d3d6db',
					500: '#c9cdd2',
				},
				neublue: {
					100: '#e6f0ff',
					200: '#cce0ff',
					300: '#99c2ff',
					400: '#66a3ff',
					500: '#3385ff',
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				},
				'fade-in': {
					'0%': {
						opacity: '0',
					},
					'100%': {
						opacity: '1',
					},
				},
				'fade-out': {
					'0%': {
						opacity: '1',
					},
					'100%': {
						opacity: '0',
					},
				},
				'scale-in': {
					'0%': {
						opacity: '0',
						transform: 'scale(0.95)',
					},
					'100%': {
						opacity: '1',
						transform: 'scale(1)',
					},
				},
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'fade-in': 'fade-in 0.3s ease-out forwards',
				'fade-out': 'fade-out 0.3s ease-out forwards',
				'scale-in': 'scale-in 0.3s ease-out forwards',
			},
			boxShadow: {
				'neu-flat': '5px 5px 10px #d1d9e6, -5px -5px 10px #ffffff',
				'neu-pressed': 'inset 2px 2px 5px #d1d9e6, inset -2px -2px 5px #ffffff',
				'neu-convex': '5px 5px 10px #d1d9e6, -5px -5px 10px #ffffff, inset 1px 1px 2px #ffffff, inset -1px -1px 2px #d1d9e6',
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
