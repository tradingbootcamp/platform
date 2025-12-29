import type { Config } from 'tailwindcss';
import tailwindcssAnimate from 'tailwindcss-animate';
import { fontFamily } from 'tailwindcss/defaultTheme';

const config: Config = {
	darkMode: ['class'],
	content: ['./src/**/*.{html,js,svelte,ts}', './node_modules/layerchart/**/*.{svelte,js}'],
	safelist: ['dark'],
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
				border: 'hsl(var(--border) / <alpha-value>)',
				input: 'hsl(var(--input) / <alpha-value>)',
				ring: 'hsl(var(--ring) / <alpha-value>)',
				background: 'hsl(var(--background) / <alpha-value>)',
				foreground: 'hsl(var(--foreground) / <alpha-value>)',
				primary: {
					DEFAULT: 'hsl(var(--primary) / <alpha-value>)',
					foreground: 'hsl(var(--primary-foreground) / <alpha-value>)'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary) / <alpha-value>)',
					foreground: 'hsl(var(--secondary-foreground) / <alpha-value>)'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive) / <alpha-value>)',
					foreground: 'hsl(var(--destructive-foreground) / <alpha-value>)'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted) / <alpha-value>)',
					foreground: 'hsl(var(--muted-foreground) / <alpha-value>)'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent) / <alpha-value>)',
					foreground: 'hsl(var(--accent-foreground) / <alpha-value>)'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover) / <alpha-value>)',
					foreground: 'hsl(var(--popover-foreground) / <alpha-value>)'
				},
				card: {
					DEFAULT: 'hsl(var(--card) / <alpha-value>)',
					foreground: 'hsl(var(--card-foreground) / <alpha-value>)'
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
				surface: {
					content: 'hsl(var(--card-foreground) / <alpha-value>)',
					100: 'hsl(var(--background) / <alpha-value>)',
					200: 'hsl(var(---muted) / <alpha-value>)',
					// not sure what color maps here (should be darker than 200).  Could add a new color to `app.css`
					300: 'hsl(var(--background) / <alpha-value>)'
				}
			},
			borderRadius: {
				xl: 'calc(var(--radius) + 4px)',
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			fontFamily: {
				sans: [...fontFamily.sans]
			},
			keyframes: {
				'accordion-down': {
					from: { height: '0' },
					to: { height: 'var(--radix-accordion-content-height)' }
				},
				'accordion-up': {
					from: { height: 'var(--radix-accordion-content-height)' },
					to: { height: '0' }
				},
				'caret-blink': {
					'0%,70%,100%': { opacity: '1' },
					'20%,50%': { opacity: '0' }
				},
				'home-collapse': {
					'0%': { top: '0', left: '2.5rem' },
					'25%': { top: '1.2rem', left: '2.3rem' },
					'50%': { top: '2rem', left: '1.8rem' },
					'75%': { top: '2.35rem', left: '1rem' },
					'100%': { top: '2.5rem', left: '0' }
				},
				'home-expand': {
					'0%': { top: '2.5rem', left: '0' },
					'25%': { top: '2.35rem', left: '1rem' },
					'50%': { top: '2rem', left: '1.8rem' },
					'75%': { top: '1.2rem', left: '2.3rem' },
					'100%': { top: '0', left: '2.5rem' }
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'caret-blink': 'caret-blink 1.25s ease-out infinite',
				'home-collapse': 'home-collapse 0.2s linear forwards',
				'home-expand': 'home-expand 0.2s linear forwards'
			}
		}
	},
	plugins: [
		tailwindcssAnimate,
		function ({ addUtilities }) {
			const newUtilities = {
				'.puzzle-hunt-frame': {
					position: 'relative',
					zIndex: '0',
					'&::before': {
						content: '""',
						position: 'absolute',
						top: 'calc(-17% + 0.5rem)',
						left: 'calc(-10% + 0.5rem)',
						width: 'calc(100% + 20% - 1rem)',
						height: 'calc(100% + 34% - 1rem)',
						backgroundImage: "url('$lib/assets/leaf-border.png')",
						backgroundSize: '100% 100%',
						backgroundPosition: 'center',
						backgroundRepeat: 'no-repeat',
						opacity: '0.65',
						zIndex: '-1',
						pointerEvents: 'none'
					},
					'.dark &::before': {
						opacity: '0.75'
					}
				}
			};
			addUtilities(newUtilities);
		}
	]
};

export default config;
