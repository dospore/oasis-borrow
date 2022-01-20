import { Icon } from '@makerdao/dai-ui-icons'
import { trackingEvents } from 'analytics/analytics'
import { isAppContextAvailable } from 'components/AppContextProvider'
import { AppSpinner } from 'helpers/AppSpinner'
import { useTranslation } from 'next-i18next'
import React, { FormEvent, useState } from 'react'
import { useEffect } from 'react'
import { GRADIENTS } from 'theme'
import { Box, Button, Flex, Grid, Heading, Input, Text } from 'theme-ui'

import { createNewsletter$, NewsletterMessage, NewsletterState } from './newsletter'
import { NewsletterResponseMessage } from './newsletterApi'

export const NEWSLETTER_FORM_ERROR: {
  [key in NewsletterMessage | NewsletterResponseMessage]: string
} = {
  unknown: 'unknown',
  emailIsInvalid: 'email-is-invalid',
  emailAlreadyExists: 'email-already-exists',
  emailPending: 'email-pending',
}

function NewsletterFormSuccess({ small }: { small?: boolean }) {
  const { t } = useTranslation()

  return (
    <Box sx={{ textAlign: small ? 'left' : 'center' }}>
      <Box
        sx={{
          display: 'inline-flex',
          bg: 'backgroundAlt',
          borderRadius: '3em',
          px: 4,
          py: 3,
          alignItems: 'center',
        }}
      >
        <Flex
          sx={{
            mx: 'auto',
            width: small ? '32px' : '40px',
            height: small ? '32px' : '40px',
            alignItems: 'center',
            justifyContent: 'center',
            background: GRADIENTS.newsletterSuccess,
            borderRadius: '50%',
          }}
        >
          <Icon name="checkmark" color="surface" size={small ? 16 : 21} />
        </Flex>
        <Box sx={{ flex: 1, ml: 3, textAlign: 'center' }}>
          <Text
            sx={{
              color: 'text.subtitle',
              fontSize: small ? 1 : 3,
              py: 1,
              maxWidth: '32em',
              textAlign: 'left',
              fontWeight: 'semiBold',
            }}
          >
            {t('newsletter.success')}
          </Text>
        </Box>
      </Box>
    </Box>
  )
}

function NewsletterForm({ small }: { small?: boolean }) {
  const [inputOnFocus, setInputOnFocus] = useState(false)
  const [newsletterForm, setNewsletterForm] = useState<NewsletterState | undefined>(undefined)
  const { t } = useTranslation()

  useEffect(() => {
    const subscription = createNewsletter$().subscribe((v) => setNewsletterForm(v))

    return () => subscription.unsubscribe()
  }, [])

  if (!newsletterForm) return null
  const { change, email, submit, messages, messageResponse, stage } = newsletterForm

  function onSubmit(e: FormEvent<HTMLDivElement>) {
    e.preventDefault()

    if (submit) {
      submit()
      trackingEvents.newsletterSubscribe(small ? 'Footer' : 'Homepage')
    }
  }

  const showError = (messages.length > 0 && email !== '' && !inputOnFocus) || messageResponse

  const errorKey = NEWSLETTER_FORM_ERROR[messages[0] || messageResponse]

  return stage === 'success' ? (
    <NewsletterFormSuccess small={small} />
  ) : (
    <Box
      as="form"
      onSubmit={onSubmit}
      sx={{
        maxWidth: '610px',
        width: '100%',
        mx: 'auto',
      }}
    >
      <Flex
        sx={{
          borderRadius: '2em',
          bg: ['transparent', 'bgPrimaryAlt'],
          border: 'light',
          borderColor: 'newsletterInputBorder',
          height: small ? '38px' : 'initial',
          px: 2,
        }}
      >
        <Input
          placeholder={t('newsletter.placeholder')}
          sx={{
            bg: 'bgPrimaryAlt',
            borderRadius: 'inherit',
            border: 'none',
            px: 3,
            flex: 1,
            fontSize: small ? 2 : 3,
            lineHeight: 1.2,
          }}
          value={email}
          onChange={(e) => {
            change({ kind: 'email', email: e.target.value })
          }}
          onFocus={() => setInputOnFocus(true)}
          onBlur={() => setInputOnFocus(false)}
        />
        <Button
          variant="textual"
          sx={{
            fontWeight: 'semiBold',
            borderRadius: 'inherit',
            fontSize: 2,
            letterSpacing: '0.02em',
            lineHeight: 'inputLarge',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            color: 'primary',
            '&:disabled': {
              opacity: 0.7,
              cursor: 'not-allowed',
            },
          }}
          type="submit"
          disabled={!submit}
        >
          {stage === 'inProgress' ? (
            <AppSpinner sx={{ color: 'primary' }} variant="styles.spinner.large" />
          ) : (
            <Flex sx={{ alignItems: 'center' }}>
              <Text mr={1}>{t('newsletter.button')}</Text>
              <Icon size="auto" height="14px" name="arrow_right" />
            </Flex>
          )}
        </Button>
      </Flex>
      <Box sx={{ mt: 2, minHeight: '1.3em' }}>
        {showError && (
          <Text sx={{ textAlign: 'left', color: 'onError', fontSize: 2 }}>
            {errorKey ? t(`newsletter.errors.${errorKey}`) : messageResponse}
          </Text>
        )}
      </Box>
    </Box>
  )
}

export function NewsletterSection({ small }: { small?: boolean }) {
  const { t } = useTranslation()

  return (
    <Box
      sx={{
        ...(small && {
          '@media screen and (max-width: 1024px)': {
            gridColumn: '1/-1',
            maxWidth: '480px',
            ml: '0',
          },
        }),
      }}
    >
      <Grid sx={{ textAlign: small ? 'left' : 'center' }} gap={1} mb={small ? 3 : 4}>
        <Heading variant="header2" sx={{ fontWeight: 'body', fontSize: small ? 4 : 7 }}>
          {t('newsletter.title')}
        </Heading>
        {small && <Text sx={{ color: 'text.subtitle' }}>{t('newsletter.subtitle')}</Text>}
      </Grid>
      {isAppContextAvailable() ? <NewsletterForm small={small} /> : null}
    </Box>
  )
}