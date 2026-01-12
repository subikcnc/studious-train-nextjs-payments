import i18next from "i18next"

const I18 = () => {
    i18next.init({
        debug: false,
        lng: 'en',
        resources: {
            en: {
                translation: {
                    key: 'hello world'
                }
            },
            de: {
                translation: {
                    key: 'hallo welt'
                }
            }
        }
    })
    console.log(i18next.t('unknown'))
  return null;
}

export default I18