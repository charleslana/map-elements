import { closeIconBase64, infoIconBase64 } from './data/image';
import { getBooleanStorage, saveBooleanStorage } from './data/localStorage';
import { getHTMLInputElementById } from './utils/utils';
import { IMapId } from './interface/IMapId';
import { TabSingleton } from './singleton/TabSingleton';

export const initMapId = async (): Promise<void> => {
  listenSwitch();
  listenDOM();
  await formMapId();
  await clearMap();
};

const switchMarkingsId = 'switch-markings';
const switchInfoId = 'switch-info';
const switchMarkingsKey = 'switchMarkings';
const switchInfoKey = 'switchInfo';

const formMapId = async (): Promise<void> => {
  const mapIdForm = document.getElementById('mapId');
  if (mapIdForm) {
    mapIdForm.addEventListener('submit', async event => {
      event.preventDefault();
      await executeMapId();
    });
  }
};

const executeMapId = async (): Promise<void> => {
  const switchMarkings = getHTMLInputElementById(switchMarkingsId);
  const switchInfo = getHTMLInputElementById(switchInfoId);
  const tab = await TabSingleton.getInstance();
  if (tab && tab.id && switchMarkings && switchInfo) {
    const { id } = tab;
    const markingsChecked = switchMarkings.checked;
    const infoChecked = switchInfo.checked;
    executeChromeScript(id, {
      markingsChecked,
      infoChecked,
      infoIcon: infoIconBase64,
      closeIcon: closeIconBase64,
    });
  }
};

const executeChromeScript = (tabId: number, mapId: IMapId): void => {
  chrome.scripting.executeScript(
    {
      target: {
        tabId,
      },
      func: getIds,
      args: [mapId],
    },
    ([count]) => {
      const totalIds = document.getElementById('totalIds');
      if (totalIds) {
        totalIds.textContent = `Total de ID's: ${count.result}`;
        totalIds.classList.remove('hidden');
      }
    }
  );
};

const getIds = (mapId: IMapId): number => {
  const generatorMarkings = document.querySelectorAll('.map-generator-markings');
  generatorMarkings.forEach(parent => {
    parent.replaceWith(...parent.childNodes);
  });
  const modal = document.querySelector('.map-generator-modal');
  if (modal && modal.parentNode) {
    modal.parentNode.removeChild(modal);
  }
  // create modal
  const bodyDiv = document.createElement('div');
  bodyDiv.style.display = 'none';
  bodyDiv.style.position = 'fixed';
  bodyDiv.style.top = '50%';
  bodyDiv.style.left = '50%';
  bodyDiv.style.transform = 'translate(-50%, -50%)';
  bodyDiv.style.backgroundColor = 'white';
  bodyDiv.style.border = '1px solid #ccc';
  bodyDiv.style.padding = '20px';
  bodyDiv.style.zIndex = '99999';
  bodyDiv.className = 'map-generator-modal';
  bodyDiv.style.color = 'black';
  bodyDiv.style.fontFamily =
    "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif";
  // Criando um elemento parágrafo para exibir o texto
  const contentParagraph = document.createElement('p');
  contentParagraph.style.margin = '0px';
  bodyDiv.appendChild(contentParagraph);

  contentParagraph.textContent = 'Texto que será copiado';

  const messageDiv = document.createElement('div');
  messageDiv.style.marginTop = '5px';
  messageDiv.classList.add('copy-message');

  // Adicionando o botão de copiar
  const copyButton = document.createElement('button');
  copyButton.textContent = 'Copiar';
  copyButton.style.borderRadius = '5px'; // Adicionando border radius
  copyButton.style.backgroundColor = 'lightgray'; // Cor de fundo clara
  copyButton.style.color = 'black';
  copyButton.style.border = 'none'; // Removendo a borda
  copyButton.style.padding = '10px 15px'; // Adicionando espaçamento interno
  copyButton.style.cursor = 'pointer';
  copyButton.style.marginTop = '10px';
  copyButton.addEventListener('click', () => {
    bodyDiv.appendChild(messageDiv);
    // Copiando o texto para a área de transferência usando a API Clipboard
    const fullText = contentParagraph.textContent ?? '';

    // Encontrando a posição do caractere "#" no texto
    const hashIndex = fullText.indexOf('#');

    let textToCopy = '';
    if (hashIndex !== -1 && hashIndex < fullText.length - 1) {
      // Copiando apenas o texto após o caractere "#"
      textToCopy = fullText.substring(hashIndex);
    }
    navigator.clipboard
      .writeText(textToCopy)
      .then(() => {
        messageDiv.textContent = 'ID copiado!';
        setTimeout(() => {
          bodyDiv.removeChild(messageDiv);
        }, 2000);
      })
      .catch(err => {
        messageDiv.textContent = `Erro ao copiar texto: ${err}`;
      });
  });
  bodyDiv.appendChild(copyButton);

  const closeIcon = document.createElement('img');
  closeIcon.src = mapId.closeIcon;
  closeIcon.className = 'map-generator-markings';
  closeIcon.style.width = '32px';
  closeIcon.style.position = 'absolute';
  closeIcon.style.top = '-10px';
  closeIcon.style.right = '-20px';
  closeIcon.style.transform = 'translateY(-50%)';
  closeIcon.style.cursor = 'pointer';
  closeIcon.style.zIndex = '2';
  closeIcon.addEventListener('click', () => {
    const modal = document.querySelector('.map-generator-modal') as HTMLDivElement | null;
    if (modal) {
      modal.style.display = 'none';
      const existingMessage = bodyDiv.querySelector('.copy-message');
      if (existingMessage) {
        bodyDiv.removeChild(existingMessage);
      }
    }
  });
  bodyDiv.appendChild(closeIcon);

  document.body.insertAdjacentElement('afterend', bodyDiv);
  // create markings
  const ids = document.querySelectorAll('[id]');
  if (mapId.markingsChecked) {
    ids.forEach(id => {
      const div = document.createElement('div');
      div.className = 'map-generator-markings';
      div.style.border = '5px solid red';
      div.style.position = 'relative';
      if (id.parentNode) {
        id.parentNode.insertBefore(div, id);
      }
      div.appendChild(id);
      // create info icon
      if (mapId.infoChecked) {
        const icon = document.createElement('img');
        icon.src = mapId.infoIcon;
        icon.className = 'map-generator-markings';
        icon.style.width = '32px';
        icon.style.position = 'absolute';
        icon.style.top = '-10px';
        icon.style.right = '-20px';
        icon.style.transform = 'translateY(-50%)';
        icon.style.cursor = 'pointer';
        icon.style.zIndex = '1';
        // click icon
        icon.addEventListener('click', () => {
          const modal = document.querySelector('.map-generator-modal') as HTMLDivElement | null;
          if (modal) {
            modal.style.display = 'block';
            const paragraphElement = modal.querySelector('p');
            if (paragraphElement) {
              paragraphElement.textContent = `ID: #${id.getAttribute('id')}`;
            }
          }
        });
        div.appendChild(icon);
      }
    });
  }
  // get length
  return ids.length;
};

const listenSwitch = (): void => {
  document.addEventListener('change', event => {
    const switchMarkings = getHTMLInputElementById(switchMarkingsId);
    const switchInfo = getHTMLInputElementById(switchInfoId);
    if (switchMarkings && event.target === switchMarkings) {
      saveBooleanStorage(switchMarkingsKey, switchMarkings.checked);
      if (!switchMarkings.checked && switchInfo) {
        switchInfo.checked = false;
        saveBooleanStorage(switchInfoKey, switchInfo.checked);
      }
    }
    if (switchInfo && event.target === switchInfo) {
      if (switchMarkings && !switchMarkings.checked) {
        switchInfo.checked = false;
      }
      saveBooleanStorage(switchInfoKey, switchInfo.checked);
    }
  });
};

const listenDOM = (): void => {
  document.addEventListener('DOMContentLoaded', () => {
    const switchMarkings = getHTMLInputElementById(switchMarkingsId);
    if (switchMarkings) {
      switchMarkings.checked = getBooleanStorage(switchMarkingsKey);
    }
    const switchInfo = getHTMLInputElementById(switchInfoId);
    if (switchInfo) {
      switchInfo.checked = getBooleanStorage(switchInfoKey);
    }
  });
};

const clearMap = async () => {
  const clearMap = document.getElementById('clearMap');
  const tab = await TabSingleton.getInstance();
  if (clearMap) {
    clearMap.addEventListener('click', () => {
      const totalIds = document.getElementById('totalIds');
      if (tab && tab.id && totalIds) {
        totalIds.classList.add('hidden');
        chrome.scripting.executeScript({
          target: {
            tabId: tab.id,
          },
          func: () => {
            // remove markings and modal
            const generatorMarkings = document.querySelectorAll('.map-generator-markings');
            generatorMarkings.forEach(parent => {
              parent.replaceWith(...parent.childNodes);
            });
            const modal = document.querySelector('.map-generator-modal');
            if (modal && modal.parentNode) {
              modal.parentNode.removeChild(modal);
            }
          },
          args: [],
        });
      }
    });
  }
};
